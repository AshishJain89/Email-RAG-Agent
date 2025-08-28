import React, { useEffect, useState } from 'react'
import API_BASE from '../config'

function Escalations() {
  const [escalations, setEscalations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadEscalations() {
      try {
        const res = await fetch(`${API_BASE}/email/escalations`)
        const data = await res.json()
        if (data.status === 'success') {
          setEscalations(data.escalations || [])
        } else {
          setError(data.message || 'Failed to load escalations')
        }
      } catch (e) {
        setError(String(e))
      } finally {
        setLoading(false)
      }
    }
    loadEscalations()
  }, [])

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown time'
    return new Date(timestamp * 1000).toLocaleString()
  }

  const handleResolve = async (runId) => {
    try {
      const res = await fetch(`${API_BASE}/resolve-escalation/${runId}`, {
        method: 'POST',
      })
      const data = await res.json()
      if (data.resolved) {
        // Remove the resolved escalation from the list
        setEscalations(prev => prev.filter(item => item.run_id !== runId))
      }
    } catch (e) {
      console.error('Failed to resolve escalation:', e)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">🚨 Escalations</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        {loading && <div className="text-center py-4">Loading escalations...</div>}
        
        {error && (
          <div className="text-red-600 bg-red-50 p-4 rounded-md mb-4">
            Error: {error}
          </div>
        )}
        
        {!loading && !error && (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Total escalations: {escalations.length}
            </div>
            
            {escalations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No escalations found. All emails are being processed successfully! 🎉
              </div>
            ) : (
              <div className="space-y-4">
                {escalations.map((item, index) => (
                  <div key={item.run_id || index} className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          ID: {item.run_id}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium text-red-600 bg-red-100">
                          ESCALATED
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatTimestamp(item.timestamp)}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <div className="text-sm font-medium text-gray-700 mb-1">Original Email:</div>
                      <div className="text-sm text-gray-600 bg-white p-2 rounded border">
                        {item.email_content || 'No content'}
                      </div>
                    </div>
                    
                    {item.draft_reply && (
                      <div className="mb-3">
                        <div className="text-sm font-medium text-gray-700 mb-1">Draft Reply (Not Sent):</div>
                        <div className="text-sm text-gray-600 bg-yellow-50 p-2 rounded border border-yellow-200">
                          {item.draft_reply}
                        </div>
                      </div>
                    )}
                    
                    <div className="mb-3">
                      <div className="text-sm font-medium text-red-700 mb-1">Escalation Reason:</div>
                      <div className="text-sm text-red-600 bg-red-100 p-2 rounded">
                        {item.escalation_reason}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleResolve(item.run_id)}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                      >
                        Mark as Resolved
                      </button>
                      <button
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                        onClick={() => {
                          // This could open a modal for manual reply
                          alert('Manual reply feature coming soon!')
                        }}
                      >
                        Send Manual Reply
                      </button>
                    </div>
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

export default Escalations
