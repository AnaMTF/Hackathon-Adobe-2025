"use client";

import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

type UserStatus = "online" | "away" | "busy" | "offline";

export function useUserStatus() {
  const { user } = useAuth();

  // Update user status
  const updateStatus = async (status: UserStatus) => {
    // if (!user) return;

    // try {
    //   const response = await fetch('/api/users/status', {
    //     method: 'PUT',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({ status }),
    //   });

    //   if (response.ok) {
    //     console.log(`[useUserStatus] Status updated to: ${status}`);
    //     // Store in localStorage to restore after page reload
    //     localStorage.setItem('user_status_preference', status);
    //   }
    // } catch (error) {
    //   console.error('[useUserStatus] Error updating status:', error);
    // }
  };

  // Send heartbeat to keep lastSeen updated
  const sendHeartbeat = async () => {
    // if (!user) return;

    // try {
    //   await fetch('/api/users/status', {
    //     method: 'POST',
    //   });
    // } catch (error) {
    //   console.error('[useUserStatus] Error sending heartbeat:', error);
    // }
  };

  // Set up automatic status management
  useEffect(() => {
    // if (!user) return;

    // // Get saved status preference or default to 'online'
    // const savedStatus = localStorage.getItem('user_status_preference') as UserStatus || 'online';
    
    // // Set status to saved preference when user logs in
    // updateStatus(savedStatus);

    // // Set up heartbeat interval (every 30 seconds)
    // const heartbeatInterval = setInterval(() => {
    //   sendHeartbeat();
    // }, 30000);

    // // Track browser visibility
    // const handleVisibilityChange = () => {
    //   if (document.hidden) {
    //     // Tab is hidden - set to away after 5 minutes
    //     const awayTimeout = setTimeout(() => {
    //       if (document.hidden) {
    //         updateStatus('away');
    //       }
    //     }, 5 * 60 * 1000); // 5 minutes

    //     // Store timeout ID to clear it if tab becomes visible again
    //     (window as typeof window & { awayTimeout?: NodeJS.Timeout }).awayTimeout = awayTimeout;
    //   } else {
    //     // Tab is visible again - restore saved status
    //     if ((window as typeof window & { awayTimeout?: NodeJS.Timeout }).awayTimeout) {
    //       clearTimeout((window as typeof window & { awayTimeout?: NodeJS.Timeout }).awayTimeout);
    //     }
    //     const currentStatus = localStorage.getItem('user_status_preference') as UserStatus || 'online';
    //     updateStatus(currentStatus);
    //   }
    // };

    // document.addEventListener('visibilitychange', handleVisibilityChange);

    // // Set to offline when all tabs are closed (beforeunload)
    // const handleBeforeUnload = () => {
    //   // Use sendBeacon for reliable delivery during page unload
    //   const status = 'offline';
    //   const blob = new Blob([JSON.stringify({ status })], { type: 'application/json' });
    //   navigator.sendBeacon('/api/users/status', blob);
    // };

    // window.addEventListener('beforeunload', handleBeforeUnload);

    // // Cleanup
    // return () => {
    //   clearInterval(heartbeatInterval);
    //   document.removeEventListener('visibilitychange', handleVisibilityChange);
    //   window.removeEventListener('beforeunload', handleBeforeUnload);
      
    //   // Set offline on unmount (component cleanup)
    //   updateStatus('offline');
    // };
    // // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return {
    updateStatus,
    sendHeartbeat,
  };
}
