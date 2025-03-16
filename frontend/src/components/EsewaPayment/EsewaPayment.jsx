import { useEffect, useState } from "react";

function EsewaPayment() {
  const [orders, setOrders] = useState([]);

  const handlePayment = async (payment_method) => {
    const url = "api/orders/create";
    const data = {
      amount: 100,
      products: [{ product: "test", amount: 100, quantity: 1 }],
      payment_method,
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log(responseData);
        if (responseData.payment_method === "esewa") {
          esewaCall(responseData.formData);
        } else if (responseData.payment_method === "khalti") {
          khaltiCall(responseData.data);
        }
      } else {
        console.error("Failed to fetch:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Error during fetch:", error);
    }
  };

  const khaltiCall = (data) => {
    window.location.href = data.payment_url;
  };

  const esewaCall = (formData) => {
    console.log(formData);
    var path = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

    var form = document.createElement("form");
    form.setAttribute("method", "POST");
    form.setAttribute("action", path);

    for (var key in formData) {
      var hiddenField = document.createElement("input");
      hiddenField.setAttribute("type", "hidden");
      hiddenField.setAttribute("name", key);
      hiddenField.setAttribute("value", formData[key]);
      form.appendChild(hiddenField);
    }

    document.body.appendChild(form);
    form.submit();
  };

  useEffect(() => {
    const getOrders = async () => {
      const url = "api/orders";

      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const responseData = await response.json();
          console.log(responseData);
          setOrders(responseData);
        } else {
          console.error("Failed to fetch:", response.status, response.statusText);
        }
      } catch (error) {
        console.error("Error during fetch:", error);
      }
    };
    getOrders();
  }, []);

  return (
    <>
      <h1>Esewa Test</h1>
      <button
        style={{ background: "#55aa33", margin: 10 }}
        onClick={() => handlePayment("esewa")}
      >
        Handle Esewa Payment
      </button>
      <button
        style={{ background: "#55aa33", margin: 10 }}
        onClick={() => handlePayment("khalti")}
      >
        Handle Khalti Payment
      </button>

      <table border={1}>
        <thead>
          <tr>
            <th>Id</th>
            <th>Status</th>
            <th>Amount</th>
            <th>Transaction Code</th>
            <th>Payment Method</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => (
            <tr key={order._id}>
              <td>{order._id}</td>
              <td>{order.status}</td>
              <td>{order.amount}</td>
              <td>{order.transaction_code}</td>
              <td>{order.payment_method}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default EsewaPayment;
