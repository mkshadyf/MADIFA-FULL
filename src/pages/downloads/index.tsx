// import React, { useEffect, useState } from 'react'
// import { useDownloadQueue } from '@/hooks/useDownloadQueue'
// import { useStorageQuota } from '@/hooks/useStorageQuota'
// import { formatBytes } from '@/lib/utils/format'
// import type { Content } from '@/types'

// interface StorageStats {
//   used: number
//   quota: number
//   percentage: number
// }

// export default function DownloadsPage() {
//   const [storageStats, setStorageStats] = useState<StorageStats>({
//     used: 0,
//     quota: 0,
//     percentage: 0,
//   })
//   //const { queueItems } = useDownloadQueue()
//   const { quotaStats } = useStorageQuota()

//   useEffect(() => {
//     setStorageStats({
//       used: quotaStats.used,
//       quota: quotaStats.quota,
//       percentage: (quotaStats.used / quotaStats.quota) * 100,
//     })
//   }, [quotaStats])

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'completed':
//         return 'text-green-500'
//       case 'failed':
//         return 'text-red-500'
//       case 'downloading':
//         return 'text-blue-500'
//       default:
//         return 'text-gray-500'
//     }
//   }

//   const getStatusText = (status: string) => {
//     switch (status) {
//       case 'completed':
//         return 'Downloaded'
//       case 'failed':
//         return 'Failed'
//       case 'downloading':
//         return 'Downloading...'
//       default:
//         return 'Pending'
//     }
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="mb-8">
//         <h1 className="mb-4 text-2xl font-bold">Downloads</h1>
//         <div className="rounded-lg bg-white p-4 shadow">
//           <div className="mb-2 flex items-center justify-between">
//             <span className="text-sm text-gray-600">Storage Usage</span>
//             <span className="text-sm font-medium">
//               {formatBytes(storageStats.used)} /{' '}
//               {formatBytes(storageStats.quota)}
//             </span>
//           </div>
//           <div className="h-2 overflow-hidden rounded-full bg-gray-200">
//             <div
//               className={`h-full rounded-full transition-all duration-300 ${
//                 storageStats.percentage > 90
//                   ? 'bg-red-500'
//                   : storageStats.percentage > 70
//                     ? 'bg-yellow-500'
//                     : 'bg-blue-500'
//               }`}
//               style={{ width: `${Math.min(storageStats.percentage, 100)}%` }}
//             />
//           </div>
//         </div>
//       </div>

//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//         {/* {queueItems.map(item => (
//           <div
//             key={item.id}
//             className="overflow-hidden rounded-lg bg-white shadow"
//           >
//             <img
//               src={item.content.thumbnail_url || '/placeholder-image.jpg'}
//               alt={item.content.title}
//               className="h-48 w-full object-cover"
//             />
//             <div className="p-4">
//               <h3 className="mb-2 font-medium">{item.content.title}</h3>
//               {item.content.description && (
//                 <p className="mb-4 text-sm text-gray-600">
//                   {item.content.description.length > 100
//                     ? `${item.content.description.slice(0, 100)}...`
//                     : item.content.description}
//                 </p>
//               )}
//               <div className="flex items-center justify-between">
//                 <span className={`text-sm ${getStatusColor(item.status)}`}>
//                   {getStatusText(item.status)}
//                 </span>
//                 <span className="text-sm text-gray-600">
//                   {formatBytes(item.content.size || 0)}
//                 </span>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* {queueItems.length === 0 && (
//         <div className="mt-8 text-center text-gray-500">
//           No downloads in queue
//         </div>
//       )} */}
//     </div>
//   )
// }
