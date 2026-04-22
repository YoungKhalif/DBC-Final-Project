const { v4: uuidv4 } = require('uuid');
const OrderRepository = require('../repositories/OrderRepository');
const { Order, Meal, MealItem, MenuItem, Table } = require('../models');
const { Op } = require('sequelize');
const {
  StateTransitionError,
  NotFoundError,
  ValidationError,
} = require('../utils/errors');
const eventBus = require('../events/EventBus');

/**
 * OrderService - State machine for order lifecycle
 */
class OrderService {
  constructor() {
    this.orderRepo = new OrderRepository();
    this.validTransitions = {
      draft: ['submitted', 'cancelled'],
      submitted: ['in_kitchen', 'cancelled'],
      in_kitchen: ['ready'],
      ready: ['served'],
      served: ['closed'],
      closed: [],
      cancelled: [],
    };
    this.mealItemTransitions = {
      pending: ['preparing'],
      preparing: ['ready'],
      ready: ['served'],
      served: [],
    };
  }

  /**
   * Create order in draft state
   */
  async createOrder(tableId, waiterId, meals) {
    if (!meals || meals.length === 0) {
      throw new ValidationError('At least one meal required');
    }

    for (const meal of meals) {
      for (const item of meal.items) {
        const menuItem = await MenuItem.findByPk(item.menu_item_id);
        if (!menuItem || !menuItem.is_available) {
          throw new ValidationError(`Menu item ${item.menu_item_id} not available`);
        }
      }
    }

    const sequelize = Order.sequelize;
    const transaction = await sequelize.transaction();

    try {
      const order = await Order.create(
        {
          table_id: tableId,
          waiter_id: waiterId,
          status: 'draft',
          placed_at: null,
        },
        { transaction }
      );

      for (const mealData of meals) {
        const meal = await Meal.create(
          {
            order_id: order.id,
            course_number: mealData.course_number,
          },
          { transaction }
        );

        for (const itemData of mealData.items) {
          const menuItem = await MenuItem.findByPk(itemData.menu_item_id);
          await MealItem.create(
            {
              meal_id: meal.id,
              menu_item_id: menuItem.id,
              quantity: itemData.quantity,
              unit_price: menuItem.price,
              special_instructions: itemData.special_instructions || null,
              status: 'pending',
            },
            { transaction }
          );
        }
      }

      await transaction.commit();
      return this.orderRepo.findWithDetails(order.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async submitOrder(orderId) {
    const order = await this.orderRepo.findWithDetails(orderId);
    if (!order) throw new NotFoundError('Order');

    this.validateTransition(order.status, 'submitted');

    await this.orderRepo.updateById(orderId, {
      status: 'submitted',
      placed_at: new Date(),
    });

    eventBus.emitOrderStatusChanged(orderId, 'draft', 'submitted', order.table_id, order.waiter_id);
    return this.orderRepo.findWithDetails(orderId);
  }

  async updateOrderStatus(orderId, newStatus) {
    const order = await this.orderRepo.findWithDetails(orderId);
    if (!order) throw new NotFoundError('Order');

    this.validateTransition(order.status, newStatus);

    const oldStatus = order.status;
    await this.orderRepo.updateById(orderId, { status: newStatus });

    eventBus.emitOrderStatusChanged(orderId, oldStatus, newStatus, order.table_id, order.waiter_id);
    return this.orderRepo.findWithDetails(orderId);
  }

  async updateMealItemStatus(mealItemId, newStatus, userRole) {
    const mealItem = await MealItem.findByPk(mealItemId, {
      include: [{ association: 'meal', include: [{ association: 'order' }] }],
    });

    if (!mealItem) throw new NotFoundError('Meal item');

    this.validateMealItemTransition(mealItem.status, newStatus);

    if (userRole === 'chef' && !['pending', 'preparing', 'ready'].includes(newStatus)) {
      throw new ValidationError('Chef can only set pending→preparing→ready');
    }

    if (userRole === 'waiter' && newStatus !== 'served') {
      throw new ValidationError('Waiter can only mark as served');
    }

    const oldStatus = mealItem.status;
    await mealItem.update({ status: newStatus });

    eventBus.emitMealItemStatusChanged(mealItemId, mealItem.meal.order_id, oldStatus, newStatus);

    const meal = mealItem.meal;
    const pendingItemsCount = await MealItem.count({
      where: { meal_id: meal.id, status: { [Op.ne]: 'served' } },
    });

    if (pendingItemsCount === 0 && meal.order && meal.order.status === 'ready') {
      await this.updateOrderStatus(meal.order.id, 'served');
    }

    return mealItem;
  }

  async cancelOrder(orderId) {
    const order = await this.orderRepo.findWithDetails(orderId);
    if (!order) throw new NotFoundError('Order');

    if (!['draft', 'submitted'].includes(order.status)) {
      throw new StateTransitionError(order.status, 'cancelled', 'Can only cancel draft or submitted orders');
    }

    await this.orderRepo.updateById(orderId, { status: 'cancelled' });
    eventBus.emitOrderStatusChanged(orderId, order.status, 'cancelled', order.table_id, order.waiter_id);
    return this.orderRepo.findWithDetails(orderId);
  }

  // --- Integrated Helper Methods ---

  async getOrder(orderId) {
    const order = await this.orderRepo.findWithDetails(orderId);
    if (!order) throw new NotFoundError('Order');
    return order;
  }

  async getTableOrders(tableId) {
    return this.orderRepo.findByTable(tableId);
  }

  async getOrdersByStatus(status) {
    return Order.findAll({
      where: { status },
      include: [{ model: Meal, include: [MealItem] }, { model: Table }]
    });
  }

  // --- Validation Logic ---

  validateTransition(from, to) {
    if (!this.validTransitions[from]) {
      throw new StateTransitionError(from, to, `Invalid current status: ${from}`);
    }
    if (!this.validTransitions[from].includes(to)) {
      throw new StateTransitionError(
        from,
        to,
        `Cannot transition from ${from} to ${to}. Valid: ${this.validTransitions[from].join(', ')}`
      );
    }
  }

  validateMealItemTransition(from, to) {
    if (!this.mealItemTransitions[from] || !this.mealItemTransitions[from].includes(to)) {
      throw new StateTransitionError(from, to, `Cannot transition meal item from ${from} to ${to}`);
    }
  }
}

module.exports = new OrderService();