import { useMemo, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Minimal payment form page intended to be embedded in an <iframe>.
 * Demo only — no real payment provider.
 */
function PaymentFormEmbed() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId") || "";
  const orderNo = searchParams.get("orderNo") || `Order #${orderId}`;
  const amount = searchParams.get("amount") || "0.00";

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<"success" | "failed" | null>(
    null
  );

  const formattedAmount = useMemo(() => {
    const value = Number(amount);
    if (Number.isNaN(value)) {
      return amount;
    }
    return value.toFixed(2);
  }, [amount]);

  const notifyParent = (
    type: "payment-success" | "payment-failed",
    message: string
  ) => {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        {
          source: "healthops-payment",
          type,
          orderId: Number(orderId) || null,
          message,
        },
        window.location.origin
      );
    }
  };

  const digitsOnly = (value: string) => value.replace(/\D/g, "");

  const formatCardNumber = (value: string) => {
    const digits = digitsOnly(value).slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  };

  const formatExpiry = (value: string) => {
    const digits = digitsOnly(value).slice(0, 4);
    if (digits.length <= 2) {
      return digits;
    }
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const validate = () => {
    const cardDigits = digitsOnly(cardNumber);
    const expiryDigits = digitsOnly(expiry);
    const cvvDigits = digitsOnly(cvv);

    if (cardDigits.length < 13 || cardDigits.length > 16) {
      return "Enter a valid card number (13–16 digits).";
    }

    if (expiryDigits.length !== 4) {
      return "Enter expiry as MM/YY.";
    }

    const month = Number(expiryDigits.slice(0, 2));
    if (month < 1 || month > 12) {
      return "Expiry month must be between 01 and 12.";
    }

    const year = 2000 + Number(expiryDigits.slice(2));
    const now = new Date();
    const expiryDate = new Date(year, month, 0, 23, 59, 59);
    if (expiryDate < now) {
      return "Card expiry date is in the past.";
    }

    if (cvvDigits.length < 3 || cvvDigits.length > 4) {
      return "Enter a valid CVV (3–4 digits).";
    }

    return "";
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setResult(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    window.setTimeout(() => {
      const cardDigits = digitsOnly(cardNumber);

      // Demo failure rule: cards ending in 0000 are declined.
      if (cardDigits.endsWith("0000")) {
        const message =
          "Payment declined. Please try another card.";
        setResult("failed");
        setError(message);
        notifyParent("payment-failed", message);
        setSubmitting(false);
        return;
      }

      const message = `Payment of $${formattedAmount} for ${orderNo} succeeded.`;
      setResult("success");
      setError("");
      notifyParent("payment-success", message);
      setSubmitting(false);
    }, 700);
  };

  return (
    <div className="payment-embed-page">
      <div className="payment-embed-card">
        <h2>Secure Payment</h2>
        <p className="payment-embed-subtitle">
          Paying <strong>${formattedAmount}</strong> for{" "}
          <strong>{orderNo}</strong>
        </p>
        <p className="payment-embed-hint">
          Demo checkout only. Use any valid-looking card. Cards ending
          in <strong>0000</strong> simulate a declined payment.
        </p>

        {error && <div className="auth-error">{error}</div>}
        {result === "success" && (
          <div className="auth-success">
            Payment successful. You can close this panel.
          </div>
        )}

        {result !== "success" && (
          <form className="payment-embed-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="cardNumber">Card Number</label>
              <input
                id="cardNumber"
                name="cardNumber"
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder="4111 1111 1111 1111"
                value={cardNumber}
                onChange={(e) =>
                  setCardNumber(formatCardNumber(e.target.value))
                }
                disabled={submitting}
              />
            </div>

            <div className="payment-embed-row">
              <div className="form-group">
                <label htmlFor="expiry">Expiry Date</label>
                <input
                  id="expiry"
                  name="expiry"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={(e) =>
                    setExpiry(formatExpiry(e.target.value))
                  }
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="cvv">CVV</label>
                <input
                  id="cvv"
                  name="cvv"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) =>
                    setCvv(digitsOnly(e.target.value).slice(0, 4))
                  }
                  disabled={submitting}
                />
              </div>
            </div>

            <button
              type="submit"
              className="primary-button payment-embed-submit"
              disabled={submitting}
            >
              {submitting ? "Processing..." : "Pay Now"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default PaymentFormEmbed;
