import { useCart } from "../context/CartContext";

function Toast() {
  const { toastMessage } = useCart();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl">
        {toastMessage}
      </div>
    </div>
  );
}

export default Toast;