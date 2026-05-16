"use client";

import { useEffect, useState } from "react";
import MobileNavbar from "@/components/MobileNavbar";
import AdminTabs from "@/components/AdminTabs";
import Footer from "@/components/Footer";

interface Order {
  id: string;
  createdAt: string;
  customerDetails: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    color?: string;
    size?: string;
  }>;
  total: number;
  status?: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [draggedOrderId, setDraggedOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const STATUSES = ['Pending', 'Payment Checked', 'Packed', 'Shipped', 'Delivered', 'Order Cancelled'];

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    // Optimistic UI update
    const previousOrders = [...orders];
    setOrders(currentOrders => currentOrders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    setUpdatingStatus(orderId);
    
    try {
      const response = await fetch('/api/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }
    } catch (err) {
      alert('Failed to update order status. Please try again.');
      setOrders(previousOrders); // Revert on error
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to permanently delete this order?')) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId }),
      });

      if (!response.ok) throw new Error('Failed to delete order');

      setOrders(currentOrders => currentOrders.filter(order => order.id !== orderId));
      setSelectedOrder(null);
    } catch (err) {
      alert('Failed to delete order. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await fetch('/api/orders');
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        const data = await response.json() as Order[];
        // Sort by newest first
        const sortedData = data.sort((a: Order, b: Order) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrders(sortedData);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An error occurred");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  const handleDragStart = (e: React.DragEvent, orderId: string) => {
    e.dataTransfer.setData('orderId', orderId);
    // Use setTimeout so the UI doesn't immediately hide the card being dragged
    setTimeout(() => setDraggedOrderId(orderId), 0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // allow drop
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const orderId = e.dataTransfer.getData('orderId');
    if (orderId) {
      const order = orders.find(o => o.id === orderId);
      if (order && (order.status || 'Pending') !== newStatus) {
        handleStatusChange(orderId, newStatus);
      }
    }
    setDraggedOrderId(null);
  };

  const getColumnTheme = (status: string) => {
    switch (status) {
      case 'Delivered': return { bg: 'bg-green-50', border: 'border-t-green-500', text: 'text-green-800' };
      case 'Order Cancelled': return { bg: 'bg-red-50', border: 'border-t-red-500', text: 'text-red-800' };
      case 'Shipped': return { bg: 'bg-indigo-50', border: 'border-t-indigo-500', text: 'text-indigo-800' };
      case 'Packed': return { bg: 'bg-blue-50', border: 'border-t-blue-500', text: 'text-blue-800' };
      case 'Payment Checked': return { bg: 'bg-orange-50', border: 'border-t-orange-500', text: 'text-orange-800' };
      case 'Pending':
      default: return { bg: 'bg-yellow-50', border: 'border-t-yellow-500', text: 'text-yellow-800' };
    }
  };

  return (
    <>
      <MobileNavbar />
      <AdminTabs />
      <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">CRM Kanban Board</h1>
            <div className="text-sm text-gray-500">Drag and drop cards to update status</div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-gray-600">Loading Kanban Board...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
          ) : (
            <div className="flex overflow-x-auto pb-8 space-x-6 snap-x">
              {STATUSES.map(status => {
                const columnOrders = orders.filter(o => (o.status || 'Pending') === status);
                const theme = getColumnTheme(status);

                return (
                  <div
                    key={status}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, status)}
                    className={`flex-shrink-0 w-[85vw] sm:w-80 max-w-[320px] rounded-xl shadow-sm border-t-4 ${theme.border} ${theme.bg} flex flex-col snap-center`}
                  >
                    <div className="p-4 border-b border-black/5 flex justify-between items-center">
                      <h2 className={`font-bold ${theme.text}`}>{status}</h2>
                      <span className="bg-white/50 px-2 py-1 rounded-full text-xs font-semibold">
                        {columnOrders.length}
                      </span>
                    </div>

                    <div className="p-3 flex-1 overflow-y-auto space-y-3 min-h-[500px]">
                      {columnOrders.map(order => (
                        <div
                          key={order.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, order.id)}
                          onDragEnd={() => setDraggedOrderId(null)}
                          className={`bg-white p-4 rounded-lg shadow cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow relative ${
                            draggedOrderId === order.id ? 'opacity-50' : 'opacity-100'
                          }`}
                        >
                          {/* Loading Overlay */}
                          {updatingStatus === order.id && (
                            <div className="absolute inset-0 bg-white/60 rounded-lg flex items-center justify-center z-10">
                              <div className="animate-spin h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full" />
                            </div>
                          )}

                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-gray-400">#{order.id.slice(0, 8)}</span>
                            <span className="text-xs text-gray-500 font-medium">
                              Rs. {order.total.toFixed(2)}
                            </span>
                          </div>
                          <h3 
                            className="font-semibold text-indigo-600 truncate mb-1 cursor-pointer hover:text-indigo-800 hover:underline transition-colors"
                            onClick={() => setSelectedOrder(order)}
                          >
                            {order.customerDetails.fullName}
                          </h3>
                          <div className="text-xs text-gray-500 flex flex-col space-y-1">
                            <span>{order.items.reduce((acc, i) => acc + i.quantity, 0)} items</span>
                            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}

                      {columnOrders.length === 0 && (
                        <div className="h-24 flex items-center justify-center border-2 border-dashed border-black/10 rounded-lg text-sm text-gray-400 font-medium">
                          Drop here
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />

      {/* Order Details Modal */}
      {selectedOrder && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity" 
          onClick={() => setSelectedOrder(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all" 
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sticky top-0 bg-white/95 backdrop-blur z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                <p className="text-sm text-gray-500 mt-1">#{selectedOrder.id}</p>
              </div>
              <div className="flex items-center gap-3 self-end sm:self-auto">
                <button 
                  onClick={() => handleDeleteOrder(selectedOrder.id)}
                  disabled={isDeleting}
                  className="px-4 py-1.5 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1 border border-red-100"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin h-3 w-3 border-2 border-red-600 border-t-transparent rounded-full" />
                      Deleting...
                    </>
                  ) : 'Delete Order'}
                </button>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-4 md:p-6 space-y-8">
              {/* Customer Details */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">Customer Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
                  <div>
                    <p className="text-gray-500 mb-1 text-xs uppercase tracking-wider font-semibold">Full Name</p>
                    <p className="font-medium text-gray-900">{selectedOrder.customerDetails.fullName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1 text-xs uppercase tracking-wider font-semibold">Email</p>
                    <p className="font-medium text-gray-900">{selectedOrder.customerDetails.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1 text-xs uppercase tracking-wider font-semibold">Phone</p>
                    <p className="font-medium text-gray-900">{selectedOrder.customerDetails.phone}</p>
                  </div>
                  <div className="sm:col-span-2 mt-2 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <p className="text-gray-500 mb-2 text-xs uppercase tracking-wider font-semibold">Shipping Address</p>
                    <p className="font-medium text-gray-900">{selectedOrder.customerDetails.address}</p>
                    <p className="font-medium text-gray-900">{selectedOrder.customerDetails.city}, {selectedOrder.customerDetails.state} {selectedOrder.customerDetails.zipCode}</p>
                  </div>
                </div>
              </section>

              {/* Order Items */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md text-sm font-bold shadow-sm">x{item.quantity}</span>
                        <div>
                          <p className="text-gray-900 font-medium">{item.name}</p>
                          <div className="flex gap-2 mt-0.5">
                            {item.color && (
                              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                                {item.color}
                              </span>
                            )}
                            {item.size && (
                              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-indigo-100 text-indigo-600 rounded">
                                Size {item.size}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-gray-900 font-semibold">Rs. {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-5 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-gray-600 font-medium text-lg">Total Amount</span>
                  <span className="text-3xl font-black text-indigo-600">Rs. {selectedOrder.total.toFixed(2)}</span>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
