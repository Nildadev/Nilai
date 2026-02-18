import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { classNames } from '~/utils/classNames';

export const WelcomeNotice = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenNotice = localStorage.getItem('nil_ai_welcome_notice');
    if (!hasSeenNotice) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('nil_ai_welcome_notice', 'true');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-sky-500/30 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-500">
                  <div className="i-ph:warning-duotone text-2xl" />
                </div>
                <h2 className="text-xl font-bold text-bolt-elements-textPrimary">Project Under Development</h2>
              </div>
              
              <div className="space-y-3 text-bolt-elements-textSecondary text-sm leading-relaxed">
                <p>
                  Chào mừng bạn đến với <span className="font-bold text-sky-500">nil.ai</span>!
                </p>
                <p>
                  Trang web này hiện đang trong quá trình lập trình và hoàn thiện. Một số tính năng có thể hoạt động chưa ổn định hoặc gặp lỗi phát sinh.
                </p>
                <p className="p-3 bg-sky-500/5 rounded-lg border border-sky-500/10 italic">
                  Nếu bạn gặp bất kỳ sự cố nào, vui lòng liên hệ hỗ trợ tại: 
                  <a href="mailto:nguyenphuc17122011@gmail.com" className="block font-medium text-sky-600 dark:text-sky-400 hover:underline mt-1">
                    nguyenphuc17122011@gmail.com
                  </a>
                </p>
              </div>

              <button
                onClick={handleClose}
                className="w-full mt-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-semibold transition-all active:scale-95 shadow-lg shadow-sky-500/20"
              >
                Tôi đã hiểu
              </button>
            </div>
            
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
