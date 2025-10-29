export default function AdminButton({ onOpen }) {
    return (
      <button
        onClick={onOpen}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg px-4 py-2 text-sm"
      >
        Admin
      </button>
    );
  }
  