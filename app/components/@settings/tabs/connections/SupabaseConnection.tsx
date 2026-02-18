import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useSupabaseConnection } from '~/lib/hooks/useSupabaseConnection';
import { logStore } from '~/lib/stores/logs';
import { classNames } from '~/utils/classNames';
import { Button } from '~/components/ui/Button';

export function SupabaseConnection() {
  const {
    connection,
    connecting,
    fetchingStats,
    fetchingApiKeys,
    isProjectsExpanded,
    setIsProjectsExpanded,
    isDropdownOpen,
    setIsDropdownOpen,
    handleConnect,
    handleDisconnect,
    selectProject,
    handleCreateProject,
    updateToken,
    isConnected,
  } = useSupabaseConnection();

  const [showToken, setShowToken] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handleConnect();
    if (success) {
      logStore.logSystem('Connected to Supabase successfully');
    }
  };

  return (
    <motion.div
      className="bg-white dark:bg-[#0A0A0A] rounded-[var(--bolt-border-radius)] shadow-sm dark:shadow-none p-4 space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="i-ph:database-fill w-4 h-4 text-sky-500" />
        <span className="text-sm font-medium text-bolt-elements-textPrimary">Supabase Connection</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Access Token Input */}
        <div>
          <label className="block text-sm text-bolt-elements-textSecondary mb-2">
            Supabase Access Token
            <a
              href="https://app.supabase.com/account/tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-sky-500 hover:text-sky-600 text-xs"
            >
              Get your token →
            </a>
          </label>
          <div className="relative">
            <input
              type={showToken ? 'text' : 'password'}
              value={connection.token}
              onChange={(e) => updateToken(e.target.value)}
              placeholder="Enter your Supabase access token"
              className={classNames(
                'w-full px-3 py-2 pr-10 rounded-[var(--bolt-border-radius)] text-sm',
                'bg-[#FAFAFA] dark:bg-[#0A0A0A]',
                'border border-[#E5E5E5] dark:border-[#1A1A1A]',
                'text-bolt-elements-textPrimary',
                'focus:outline-none focus:ring-2 focus:ring-sky-500/30',
                'transition-all duration-200',
              )}
              disabled={connecting}
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary"
            >
              {showToken ? (
                <div className="i-ph:eye-slash-fill w-4 h-4" />
              ) : (
                <div className="i-ph:eye-fill w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Connect/Disconnect Button */}
        <div className="flex items-center gap-2">
          <Button
            type="submit"
            variant={isConnected ? 'secondary' : 'primary'}
            disabled={connecting || (!isConnected && !connection.token.trim())}
            className="flex-1"
          >
            {connecting ? (
              <>
                <div className="i-ph:spinner-gap w-4 h-4 animate-spin" />
                Connecting...
              </>
            ) : isConnected ? (
              <>
                <div className="i-ph:check-circle-fill w-4 h-4 text-green-500" />
                Connected
              </>
            ) : (
              <>
                <div className="i-ph:plug-fill w-4 h-4" />
                Connect
              </>
            )}
          </Button>

          {isConnected && (
            <Button type="button" variant="danger" onClick={handleDisconnect} disabled={connecting}>
              <div className="i-ph:plug-fill w-4 h-4" />
              Disconnect
            </Button>
          )}
        </div>
      </form>

      {/* Connection Status */}
      {isConnected && connection.user && (
        <motion.div
          className="mt-4 p-3 rounded-[var(--bolt-border-radius)] bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
            <div className="i-ph:check-circle-fill w-4 h-4" />
            <span>Connected as {connection.user.email}</span>
          </div>
        </motion.div>
      )}

      {/* Projects Section */}
      {isConnected && connection.stats && (
        <div className="mt-4">
          <button
            onClick={() => setIsProjectsExpanded(!isProjectsExpanded)}
            className="w-full flex items-center justify-between p-3 rounded-[var(--bolt-border-radius)] bg-[#FAFAFA] dark:bg-[#1A1A1A] hover:bg-[#F5F5F5] dark:hover:bg-[#2A2A2A] transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="i-ph:folder-open-fill w-4 h-4 text-sky-500" />
              <span className="text-sm font-medium text-bolt-elements-textPrimary">
                Projects ({connection.stats.totalProjects})
              </span>
            </div>
            <div
              className={classNames(
                'i-ph:caret-down w-4 h-4 text-bolt-elements-textSecondary transition-transform',
                isProjectsExpanded ? 'rotate-180' : '',
              )}
            />
          </button>

          {isProjectsExpanded && (
            <motion.div
              className="mt-2 space-y-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              {fetchingStats ? (
                <div className="flex items-center gap-2 p-3 text-sm text-bolt-elements-textSecondary">
                  <div className="i-ph:spinner-gap w-4 h-4 animate-spin" />
                  Loading projects...
                </div>
              ) : connection.stats?.projects && connection.stats.projects.length > 0 ? (
                connection.stats.projects.map((project) => (
                  <div
                    key={project.id}
                    className={classNames(
                      'p-3 rounded-[var(--bolt-border-radius)] border cursor-pointer transition-colors',
                      connection.selectedProjectId === project.id
                        ? 'bg-sky-50 dark:bg-sky-900/10 border-sky-200 dark:border-sky-800'
                        : 'bg-[#FAFAFA] dark:bg-[#1A1A1A] border-[#E5E5E5] dark:border-[#2A2A2A] hover:border-sky-300 dark:hover:border-sky-700',
                    )}
                    onClick={() => selectProject(project.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-bolt-elements-textPrimary">{project.name}</span>
                          {connection.selectedProjectId === project.id && (
                            <div className="i-ph:check-circle-fill w-3 h-3 text-sky-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-bolt-elements-textSecondary">
                          <span className="flex items-center gap-1">
                            <div className="i-ph:globe-fill w-3 h-3" />
                            {project.region}
                          </span>
                          <span className="flex items-center gap-1">
                            <div className="i-ph:clock-fill w-3 h-3" />
                            {new Date(project.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div
                        className={classNames(
                          'px-2 py-1 rounded text-xs',
                          project.status === 'ACTIVE'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
                        )}
                      >
                        {project.status}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-sm text-bolt-elements-textSecondary text-center">
                  No projects found. Create a new project to get started.
                </div>
              )}

              {/* Create New Project Button */}
              <Button
                type="button"
                variant="secondary"
                onClick={handleCreateProject}
                disabled={fetchingStats}
                className="w-full mt-2"
              >
                <div className="i-ph:plus-circle-fill w-4 h-4" />
                Create New Project
              </Button>

              {/* API Keys Section */}
              {connection.selectedProjectId && connection.credentials && (
                <motion.div
                  className="mt-3 p-3 rounded-[var(--bolt-border-radius)] bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="i-ph:key-fill w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-400">API Keys Retrieved</span>
                  </div>
                  {fetchingApiKeys ? (
                    <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-300">
                      <div className="i-ph:spinner-gap w-4 h-4 animate-spin" />
                      Fetching API keys...
                    </div>
                  ) : (
                    <div className="space-y-2 text-xs text-blue-600 dark:text-blue-300">
                      <div className="flex items-center justify-between">
                        <span>Supabase URL:</span>
                        <code className="px-2 py-1 rounded bg-white dark:bg-[#0A0A0A] font-mono">
                          {connection.credentials.supabaseUrl}
                        </code>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Anon Key:</span>
                        <code className="px-2 py-1 rounded bg-white dark:bg-[#0A0A0A] font-mono truncate max-w-[200px]">
                          {connection.credentials.anonKey?.substring(0, 20)}...
                        </code>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      )}

      {/* Help Text */}
      <div className="mt-4 p-3 rounded-[var(--bolt-border-radius)] bg-[#FAFAFA] dark:bg-[#1A1A1A]">
        <div className="flex items-start gap-2">
          <div className="i-ph:info-fill w-4 h-4 text-bolt-elements-textSecondary mt-0.5" />
          <div className="text-xs text-bolt-elements-textSecondary space-y-1">
            <p>Your Supabase access token is stored locally and never sent to our servers.</p>
            <p>
              You need a Supabase access token to manage your projects. Get one from your{' '}
              <a
                href="https://app.supabase.com/account/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-500 hover:text-sky-600"
              >
                Supabase account settings
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
