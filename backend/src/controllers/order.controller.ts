import type {
  Response,
} from "express";

import { prisma } from "../config/prisma";
import type { AuthRequest } from "../middleware/auth";

import * as orderService
  from "../services/order.service";

const getOwnPatientId = async (
  userId: number
) => {
  const patient =
    await prisma.patient.findUnique({
      where: {
        userId,
      },
      select: {
        id: true,
      },
    });

  return patient?.id ?? null;
};

const assertPatientOwnsPatientId = async (
  req: AuthRequest,
  patientId: number
) => {
  if (req.user?.role !== "PATIENT") {
    return null;
  }

  const ownPatientId =
    await getOwnPatientId(req.user.userId);

  if (!ownPatientId) {
    return {
      status: 403,
      message:
        "No patient record is linked to this account",
    };
  }

  if (ownPatientId !== patientId) {
    return {
      status: 403,
      message:
        "You do not have permission to access orders for this patient",
    };
  }

  return null;
};


/*
|--------------------------------------------------------------------------
| Get Patient Orders
|--------------------------------------------------------------------------
*/

export const getPatientOrders =
  async (
    req: AuthRequest,
    res: Response
  ) => {

    try {

      const patientId =
        Number(
          req.params.patientId
        );

      if (
        Number.isNaN(patientId)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid patient ID",
        });
      }

      const ownershipError =
        await assertPatientOwnsPatientId(
          req,
          patientId
        );

      if (ownershipError) {
        return res.status(
          ownershipError.status
        ).json({
          success: false,
          message:
            ownershipError.message,
        });
      }

      const orders =
        await orderService
          .getPatientOrders(
            patientId
          );

      return res.status(200).json({
        success: true,
        data: orders,
      });

    } catch (error) {

      console.error(
        "GET PATIENT ORDERS ERROR:",
        error
      );

      if (
        error instanceof Error &&
        error.message ===
          "PATIENT_NOT_FOUND"
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Patient not found",
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch orders",
      });
    }
  };


/*
|--------------------------------------------------------------------------
| Get Order By ID
|--------------------------------------------------------------------------
*/

export const getOrderById =
  async (
    req: AuthRequest,
    res: Response
  ) => {

    try {

      const orderId =
        Number(
          req.params.id
        );

      if (
        Number.isNaN(orderId)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid order ID",
        });
      }

      const order =
        await orderService
          .getOrderById(
            orderId
          );

      const ownershipError =
        await assertPatientOwnsPatientId(
          req,
          order.patientId
        );

      if (ownershipError) {
        return res.status(
          ownershipError.status
        ).json({
          success: false,
          message:
            ownershipError.message,
        });
      }

      return res.status(200).json({
        success: true,
        data: order,
      });

    } catch (error) {

      console.error(
        "GET ORDER ERROR:",
        error
      );

      if (
        error instanceof Error &&
        error.message ===
          "ORDER_NOT_FOUND"
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found",
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch order",
      });
    }
  };


/*
|--------------------------------------------------------------------------
| Create Order
|--------------------------------------------------------------------------
*/

export const createOrder =
  async (
    req: AuthRequest,
    res: Response
  ) => {

    try {

      const {
        patientId,
        orderDate,
        status,
        paymentStatus,
        deliveryAddress,
        notes,
        items,
      } = req.body;

      if (!patientId) {
        return res.status(400).json({
          success: false,
          message:
            "Patient is required",
        });
      }

      if (
        !Array.isArray(items) ||
        items.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "At least one order item is required",
        });
      }

      const requestedPatientId =
        Number(patientId);

      const ownershipError =
        await assertPatientOwnsPatientId(
          req,
          requestedPatientId
        );

      if (ownershipError) {
        return res.status(
          ownershipError.status
        ).json({
          success: false,
          message:
            ownershipError.message,
        });
      }

      const order =
        await orderService
          .createOrder({
            patientId:
              requestedPatientId,

            orderDate,

            status,

            paymentStatus,

            deliveryAddress,

            notes,

            items,
          });

      return res.status(201).json({
        success: true,
        message:
          "Order created successfully",
        data: order,
      });

    } catch (error) {

      console.error(
        "CREATE ORDER ERROR:",
        error
      );

      if (
        error instanceof Error
      ) {

        switch (
          error.message
        ) {

          case "PATIENT_NOT_FOUND":
            return res.status(404).json({
              success: false,
              message:
                "Patient not found",
            });

          case "ORDER_ITEMS_REQUIRED":
            return res.status(400).json({
              success: false,
              message:
                "At least one order item is required",
            });

          case "INVALID_ORDER_ITEM":
            return res.status(400).json({
              success: false,
              message:
                "Product name, valid quantity and valid price are required for every item",
            });

        }
      }

      return res.status(500).json({
        success: false,
        message:
          "Failed to create order",
      });
    }
  };


/*
|--------------------------------------------------------------------------
| Update Order Status
|--------------------------------------------------------------------------
*/

export const updateOrderStatus =
  async (
    req: AuthRequest,
    res: Response
  ) => {

    try {

      const orderId =
        Number(
          req.params.id
        );

      const {
        status,
      } = req.body;

      if (
        Number.isNaN(orderId)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid order ID",
        });
      }

      const validStatuses = [
        "PENDING",
        "CONFIRMED",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
      ];

      if (
        !validStatuses.includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid order status",
        });
      }

      const order =
        await orderService
          .updateOrderStatus(
            orderId,
            status
          );

      return res.status(200).json({
        success: true,
        message:
          "Order status updated successfully",
        data: order,
      });

    } catch (error) {

      console.error(
        "UPDATE ORDER STATUS ERROR:",
        error
      );

      if (
        error instanceof Error &&
        error.message ===
          "ORDER_NOT_FOUND"
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found",
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Failed to update order status",
      });
    }
  };


/*
|--------------------------------------------------------------------------
| Update Payment Status
|--------------------------------------------------------------------------
*/

export const updatePaymentStatus =
  async (
    req: AuthRequest,
    res: Response
  ) => {

    try {

      const orderId =
        Number(
          req.params.id
        );

      const {
        paymentStatus,
      } = req.body;

      if (
        Number.isNaN(orderId)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid order ID",
        });
      }

      const validStatuses = [
        "PENDING",
        "PAID",
        "FAILED",
        "REFUNDED",
      ];

      if (
        !validStatuses.includes(
          paymentStatus
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid payment status",
        });
      }

      const order =
        await orderService
          .updatePaymentStatus(
            orderId,
            paymentStatus
          );

      return res.status(200).json({
        success: true,
        message:
          "Payment status updated successfully",
        data: order,
      });

    } catch (error) {

      console.error(
        "UPDATE PAYMENT STATUS ERROR:",
        error
      );

      if (
        error instanceof Error &&
        error.message ===
          "ORDER_NOT_FOUND"
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found",
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Failed to update payment status",
      });
    }
  };


/*
|--------------------------------------------------------------------------
| Delete Order
|--------------------------------------------------------------------------
*/

export const deleteOrder =
  async (
    req: AuthRequest,
    res: Response
  ) => {

    try {

      const orderId =
        Number(
          req.params.id
        );

      if (
        Number.isNaN(orderId)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid order ID",
        });
      }

      const result =
        await orderService
          .deleteOrder(
            orderId
          );

      return res.status(200).json({
        success: true,
        ...result,
      });

    } catch (error) {

      console.error(
        "DELETE ORDER ERROR:",
        error
      );

      if (
        error instanceof Error &&
        error.message ===
          "ORDER_NOT_FOUND"
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found",
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete order",
      });
    }
  };
