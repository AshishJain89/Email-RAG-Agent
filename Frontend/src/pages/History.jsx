import React, { useEffect, useState } from 'react'
import API_BASE from '../config'

function History() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch(`${API_BASE}/email/history`)
        const data = await res.json()
        if (data.status === 'success') {
          setHistory(data.history || [])
        } else {
          setError(data.message || 'Failed to load history')
        }
      } catch (e) {
        setError(String(e))
      } finally {
        setLoading(false)
      }
    }
    loadHistory()
  }, [])

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown time'
    return new Date(timestamp * 1000).toLocaleString()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent': return 'text-green-600 bg-green-100'
      case 'escalated': return 'text-red-600 bg-red-100'
      case 'failed': return 'text-gray-600 bg-gray-100'
      default: return 'text-blue-600 bg-blue-100'
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">📂 Email History</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        {loading && <div className="text-center py-4">Loading history...</div>}
        
        {error && (
          <div className="text-red-600 bg-red-50 p-4 rounded-md mb-4">
            Error: {error}
          </div>
        )}
        
        {!loading && !error && (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Total emails processed: {history.length}
            </div>
            
            {history.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No email history found.
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((item, index) => (
                  <div key={item.run_id || index} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          ID: {item.run_id}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatTimestamp(item.timestamp)}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <div className="text-sm font-medium text-gray-700 mb-1">Original Email:</div>
                      <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {item.email_content || 'No content'}
                      </div>
                    </div>
                    
                    {item.final_reply && (
                      <div className="mb-3">
                        <div className="text-sm font-medium text-gray-700 mb-1">Reply Sent:</div>
                        <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                          {item.final_reply}
                        </div>
                      </div>
                    )}
                    
                    {item.rewrite_count > 0 && (
                      <div className="text-xs text-orange-600">
                        Rewrites: {item.rewrite_count}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default History
