import React, { useState, useEffect } from 'react';
import { Customer } from '../types/customer';
import { PaginatedResponse } from '../types/common';
import api from '../services/api';
import CustomerForm from './CustomerForm';
import CustomerDetail from './CustomerDetail';

type ViewMode = 'list' | 'form' | 'detail';

const CustomerList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    count: 0,
    next: null as string | null,
    previous: null as string | null,
  });
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, [searchTerm]);

  const fetchCustomers = async (url?: string) => {
    try {
      setLoading(true);
      const endpoint = url || `/customers/${searchTerm ? `?search=${searchTerm}` : ''}`;
      const response = await api.get<PaginatedResponse<Customer>>(endpoint);
      
      setCustomers(response.data.results);
      setPagination({
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
      });
    } catch (err: any) {
      setError('Failed to fetch customers');
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  // Refresh function to force reload of current page
  const refreshCustomers = async () => {
    console.log('Refreshing customer list...');
    try {
      setError(''); // Clear any existing errors
      await fetchCustomers();
      console.log('Customer list refreshed successfully');
    } catch (err: any) {
      console.error('Error refreshing customers:', err);
      setError('Failed to refresh customer list');
    }
  };

  const handleNextPage = () => {
    if (pagination.next) {
      fetchCustomers(pagination.next);
    }
  };

  const handlePreviousPage = () => {
    if (pagination.previous) {
      fetchCustomers(pagination.previous);
    }
  };

  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setViewMode('form');
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setViewMode('form');
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomerId(customer.id);
    setViewMode('detail');
  };

  const handleSaveCustomer = async (customer: Customer) => {
    console.log('Customer saved, refreshing list with updated data:', customer);
    
    try {
      // For existing customers, fetch the updated record to get all computed fields
      if (customer.id) {
        console.log('Fetching updated customer data from backend...');
        const response = await api.get<Customer>(`/customers/${customer.id}/`);
        const updatedCustomer = response.data;
        console.log('Received updated customer data:', updatedCustomer);
        
        // Update the customer in the list with complete data from backend
        setCustomers(prev => {
          const index = prev.findIndex(c => c.id === customer.id);
          if (index >= 0) {
            // Update existing with fresh data from backend
            const updated = [...prev];
            updated[index] = updatedCustomer;
            console.log('Updated customer in list at index:', index);
            return updated;
          } else {
            // If not found, add to list (shouldn't happen for edits)
            console.log('Customer not found in list, adding as new');
            return [updatedCustomer, ...prev];
          }
        });
      } else {
        // For new customers, add to the beginning of the list
        console.log('Adding new customer to list');
        setCustomers(prev => [customer, ...prev]);
      }
    } catch (error) {
      console.error('Error fetching updated customer data, trying full list refresh:', error);
      // Try refreshing the entire list as a fallback
      try {
        await refreshCustomers();
        console.log('Successfully refreshed customer list after individual fetch failed');
      } catch (refreshError) {
        console.error('Full list refresh also failed, using form data as final fallback:', refreshError);
        // Final fallback to using the form data if everything fails
        setCustomers(prev => {
          const index = prev.findIndex(c => c.id === customer.id);
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = customer;
            return updated;
          } else {
            return [customer, ...prev];
          }
        });
      }
    }
    
    setViewMode('list');
    setSelectedCustomer(null);
  };

  const handleCancel = () => {
    setViewMode('list');
    setSelectedCustomer(null);
    setSelectedCustomerId(null);
  };

  // Show form view
  if (viewMode === 'form') {
    return (
      <CustomerForm
        customer={selectedCustomer || undefined}
        onSave={handleSaveCustomer}
        onCancel={handleCancel}
      />
    );
  }

  // Show detail view
  if (viewMode === 'detail' && selectedCustomerId) {
    return (
      <CustomerDetail
        customerId={selectedCustomerId}
        onEdit={handleEditCustomer}
        onBack={handleCancel}
      />
    );
  }

  if (loading && customers.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">客戶管理</h1>
          <p className="mt-2 text-sm text-gray-700">
            管理系統中的所有客戶資料
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={handleAddCustomer}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            新增客戶
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <input
          type="text"
          placeholder="搜尋客戶..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Customer Table */}
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                客戶
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                聯絡方式
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                公司
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                來源
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                訂單數
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                總消費額
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                狀態
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">操作</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        <button
                          onClick={() => handleViewCustomer(customer)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {customer.full_name}
                        </button>
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {customer.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{customer.email}</div>
                  <div className="text-sm text-gray-500">{customer.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {customer.company || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {customer.source}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {customer.total_orders}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${typeof customer.total_spent === 'number' ? customer.total_spent.toFixed(2) : parseFloat(customer.total_spent || '0').toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      customer.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {customer.is_active ? '啟用' : '停用'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEditCustomer(customer)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    編輯
                  </button>
                  <button
                    onClick={() => handleViewCustomer(customer)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    查看
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {(pagination.next || pagination.previous) && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={handlePreviousPage}
              disabled={!pagination.previous}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              上一頁
            </button>
            <button
              onClick={handleNextPage}
              disabled={!pagination.next}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              下一頁
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                顯示 <span className="font-medium">{customers.length}</span> 筆，共{' '}
                <span className="font-medium">{pagination.count}</span> 筆資料
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                <button
                  onClick={handlePreviousPage}
                  disabled={!pagination.previous}
                  className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20 disabled:opacity-50"
                >
                  上一頁
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={!pagination.next}
                  className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20 disabled:opacity-50"
                >
                  下一頁
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerList;