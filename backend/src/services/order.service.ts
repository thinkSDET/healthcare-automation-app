import { prisma } from "../config/prisma";

interface OrderItemInput {
  productName: string;
  quantity: number;
  unitPrice: number;
}

interface CreateOrderInput {
  patientId: number;
  orderDate?: string;
  status?:
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED";
  paymentStatus?:
    | "PENDING"
    | "PAID"
    | "FAILED"
    | "REFUNDED";
  deliveryAddress?: string;
  notes?: string;
  items: OrderItemInput[];
}


/*
|--------------------------------------------------------------------------
| Get Patient Orders
|--------------------------------------------------------------------------
*/

export const getPatientOrders =
  async (patientId: number) => {

    const patient =
      await prisma.patient.findUnique({
        where: {
          id: patientId,
        },
      });

    if (!patient) {
      throw new Error(
        "PATIENT_NOT_FOUND"
      );
    }

    return prisma.order.findMany({
      where: {
        patientId,
      },

      include: {
        items: true,
      },

      orderBy: {
        orderDate: "desc",
      },
    });
  };


/*
|--------------------------------------------------------------------------
| Get Order By ID
|--------------------------------------------------------------------------
*/

export const getOrderById =
  async (orderId: number) => {

    const order =
      await prisma.order.findUnique({
        where: {
          id: orderId,
        },

        include: {
          patient: {
            select: {
              id: true,
              medicalId: true,
              firstName: true,
              lastName: true,
              phone: true,
              email: true,
            },
          },

          items: true,
        },
      });

    if (!order) {
      throw new Error(
        "ORDER_NOT_FOUND"
      );
    }

    return order;
  };


/*
|--------------------------------------------------------------------------
| Create Order
|--------------------------------------------------------------------------
*/

export const createOrder =
  async (
    data: CreateOrderInput
  ) => {

    const patient =
      await prisma.patient.findUnique({
        where: {
          id: data.patientId,
        },
      });

    if (!patient) {
      throw new Error(
        "PATIENT_NOT_FOUND"
      );
    }

    if (
      !data.items ||
      data.items.length === 0
    ) {
      throw new Error(
        "ORDER_ITEMS_REQUIRED"
      );
    }

    for (const item of data.items) {

      if (
        !item.productName?.trim() ||
        !Number.isInteger(
          item.quantity
        ) ||
        item.quantity <= 0 ||
        Number(item.unitPrice) < 0
      ) {
        throw new Error(
          "INVALID_ORDER_ITEM"
        );
      }
    }

    const totalAmount =
      data.items.reduce(
        (
          total,
          item
        ) =>
          total +
          item.quantity *
            Number(item.unitPrice),
        0
      );

    const orderNo =
      `ORD-${Date.now()}`;

    return prisma.order.create({
      data: {

        orderNo,

        patientId:
          data.patientId,

        orderDate:
          data.orderDate
            ? new Date(
                data.orderDate
              )
            : new Date(),

        status:
          data.status ||
          "PENDING",

        paymentStatus:
          data.paymentStatus ||
          "PENDING",

        totalAmount,

        deliveryAddress:
          data.deliveryAddress?.trim() ||
          null,

        notes:
          data.notes?.trim() ||
          null,

        items: {
          create:
            data.items.map(
              (item) => ({
                productName:
                  item.productName.trim(),

                quantity:
                  item.quantity,

                unitPrice:
                  item.unitPrice,

                totalPrice:
                  item.quantity *
                  Number(
                    item.unitPrice
                  ),
              })
            ),
        },
      },

      include: {
        items: true,

        patient: {
          select: {
            id: true,
            medicalId: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  };


/*
|--------------------------------------------------------------------------
| Update Order Status
|--------------------------------------------------------------------------
*/

export const updateOrderStatus =
  async (
    orderId: number,
    status:
      | "PENDING"
      | "CONFIRMED"
      | "PROCESSING"
      | "SHIPPED"
      | "DELIVERED"
      | "CANCELLED"
  ) => {

    const order =
      await prisma.order.findUnique({
        where: {
          id: orderId,
        },
      });

    if (!order) {
      throw new Error(
        "ORDER_NOT_FOUND"
      );
    }

    return prisma.order.update({
      where: {
        id: orderId,
      },

      data: {
        status,
      },

      include: {
        items: true,
      },
    });
  };


/*
|--------------------------------------------------------------------------
| Update Payment Status
|--------------------------------------------------------------------------
*/

export const updatePaymentStatus =
  async (
    orderId: number,
    paymentStatus:
      | "PENDING"
      | "PAID"
      | "FAILED"
      | "REFUNDED"
  ) => {

    const order =
      await prisma.order.findUnique({
        where: {
          id: orderId,
        },
      });

    if (!order) {
      throw new Error(
        "ORDER_NOT_FOUND"
      );
    }

    return prisma.order.update({
      where: {
        id: orderId,
      },

      data: {
        paymentStatus,
      },

      include: {
        items: true,
      },
    });
  };


/*
|--------------------------------------------------------------------------
| Delete Order
|--------------------------------------------------------------------------
*/

export const deleteOrder =
  async (
    orderId: number
  ) => {

    const order =
      await prisma.order.findUnique({
        where: {
          id: orderId,
        },
      });

    if (!order) {
      throw new Error(
        "ORDER_NOT_FOUND"
      );
    }

    await prisma.order.delete({
      where: {
        id: orderId,
      },
    });

    return {
      message:
        "Order deleted successfully",
    };
  };