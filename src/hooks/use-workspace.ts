import { useState, useEffect } from 'react';
import { client } from '@/lib/api-client';
import type { WorkspaceType } from '@/lib/api-client';

const ACTIVE_WORKSPACE_KEY = 'active_workspace';

export const useWorkspace = () => {
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeWorkspace = async () => {
      try {
        // クライアントサイドでのみlocalStorageにアクセス
        const storedWorkspace = typeof window !== 'undefined' 
          ? localStorage.getItem(ACTIVE_WORKSPACE_KEY)
          : null;
        
        if (storedWorkspace) {
          setActiveWorkspace(JSON.parse(storedWorkspace));
        } else {
          const response = await client.api.v1.workspaces.$get();
          if (response.status !== 200) {
            return;
          }
          const workspaces = (await response.json() as unknown) as WorkspaceType[];
          if (workspaces.length > 0) {
            setWorkspace(workspaces[0]);
          }
        }
      } catch (error) {
        console.error('Failed to initialize workspace:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeWorkspace();
  }, []);

  const setWorkspace = (workspace: WorkspaceType) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACTIVE_WORKSPACE_KEY, JSON.stringify(workspace));
    }
    setActiveWorkspace(workspace);
  };

  const clearWorkspace = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACTIVE_WORKSPACE_KEY);
    }
    setActiveWorkspace(null);
  };

  const deleteWorkspace = async (workspaceId: string) => {
    try {
      const response = await client.api.v1.workspaces[":id"].$delete({
        param: { id: workspaceId },
      });
      
      if (response.status !== 200) {
        throw new Error('Failed to delete workspace');
      }

      if (activeWorkspace?.id === workspaceId) {
        clearWorkspace();
      }
      return true;
    } catch (error) {
      console.error('Failed to delete workspace:', error);
      return false;
    }
  };

  return {
    activeWorkspace,
    setWorkspace,
    clearWorkspace,
    deleteWorkspace,
    isLoading,
  };
};
