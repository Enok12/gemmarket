import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useAuth } from './useAuth'

export function useLogout() {
  const { logout } = useAuth()
  const router = useRouter()

  function confirmLogout() {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-gray-900">Are you sure you want to log out?</p>
        <div className="flex gap-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id)
              logout()
              toast.success('Successfully logged out')
              router.push('/')
            }}
            className="flex-1 px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Yes, Log out
          </button>
        </div>
      </div>
    ), {
      duration: 5000,
      position: 'top-center',
    })
  }

  return { confirmLogout }
}