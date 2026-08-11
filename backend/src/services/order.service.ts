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

const orderDetailInclude = {
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
} as const;

export const getOrderById =
  async (orderId: number) => {

    const order =
      await prisma.order.findUnique({
        where: {
          id: orderId,
        },

        include: orderDetailInclude,
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
| Get Order By Public Order Number
|--------------------------------------------------------------------------
*/

export const getOrderByOrderNo =
  async (orderNo: string) => {

    const normalized =
      orderNo.trim();

    if (!normalized) {
      throw new Error(
        "ORDER_NOT_FOUND"
      );
    }

    let order =
      await prisma.order.findUnique({
        where: {
          orderNo: normalized,
        },

        include: orderDetailInclude,
      });

    /*
     * Pharmacists sometimes paste only the
     * timestamp digits from ORD-{timestamp}.
     * Those values are not internal ids
     * (too large for Int PK), so retry with
     * the ORD- prefix.
     */
    if (
      !order &&
      /^\d+$/.test(normalized)
    ) {
      order =
        await prisma.order.findUnique({
          where: {
            orderNo: `ORD-${normalized}`,
          },

          include: orderDetailInclude,
        });
    }

    if (!order) {
      throw new Error(
        "ORDER_NOT_FOUND"
      );
    }

    return order;
  };


/*
|--------------------------------------------------------------------------
| Get Order By Path Identifier (id or orderNo)
|--------------------------------------------------------------------------
*/

/**
 * Resolve GET /api/orders/:id identifier.
 * - Digits within Prisma Int range → internal Order.id
 * - Otherwise → public orderNo (e.g. ORD-...)
 */
export const getOrderByIdentifier =
  async (identifier: string) => {

    const raw =
      String(identifier || "").trim();

    if (!raw) {
      throw new Error(
        "ORDER_NOT_FOUND"
      );
    }

    const PRISMA_INT_MAX =
      2147483647;

    const isInternalId =
      /^\d+$/.test(raw) &&
      Number.isSafeInteger(
        Number(raw)
      ) &&
      Number(raw) >= 1 &&
      Number(raw) <= PRISMA_INT_MAX;

    if (isInternalId) {
      return getOrderById(
        Number(raw)
      );
    }

    return getOrderByOrderNo(raw);
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