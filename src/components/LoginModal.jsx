import { useState } from 'react';

/**
 * LoginModal is a brutalist, tactical sign-in modal.
 * Styled with absolute pitch-black, rigid borders, Google/Email integration tabs,
 * and monospaced telemetry items to perfectly fit the Phosphor aesthetic.
 */
export default function LoginModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('SIGN_IN'); // 'SIGN_IN' | 'REGISTER'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`Authenticating via Email: ${email}, Action: ${activeTab}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in select-none">
      <div className="relative w-full max-w-[440px] bg-black border-2 border-outline-variant p-6 flex flex-col gap-6 neo-pop">
        
        {/* Close Button in Top-Right */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 font-data-mono text-[10px] tracking-widest text-on-surface-variant hover:text-accent-pop border border-outline-variant hover:border-accent-pop px-3 py-1 bg-surface-container-lowest transition-all hover:translate-x-[1px] hover:translate-y-[1px]"
        >
          CLOSE
        </button>

        {/* Header telemetry info */}
        <div className="flex flex-col gap-1 mt-2">
          <div className="flex justify-between items-baseline">
            <span className="font-data-mono text-[9px] text-accent-pop tracking-widest">SECURE_GATEWAY_V1</span>
            <span className="font-data-mono text-[9px] text-on-surface-variant">PORT: 443</span>
          </div>
          <div className="h-[1px] w-full bg-outline-variant"></div>
        </div>

        {/* Headline */}
        <div className="text-center">
          <h2 className="font-headline-lg text-2xl text-accent-pop uppercase tracking-tighter mb-2">
            SIGN IN TO PHOSPHOR
          </h2>
          <p className="font-data-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
            Authorize to unlock high-fidelity vector exports
          </p>
        </div>

        {/* Google Authentication */}
        <button
          onClick={() => {
            console.log("Authenticating via Google...");
            onClose();
          }}
          type="button"
          className="w-full bg-surface-container-high text-on-surface border-2 border-black font-data-mono py-2.5 font-bold hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase neo-pop-active flex items-center justify-center gap-2 text-xs"
        >
          {/* Simple clean Google vector graphic */}
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.985 0-.743-.08-1.309-.176-1.854H12.24z"/>
          </svg>
          CONTINUE WITH GOOGLE
        </button>

        {/* OR Separator */}
        <div className="flex items-center gap-4">
          <div className="h-[1px] flex-grow bg-outline-variant"></div>
          <span className="font-data-mono text-[10px] text-on-surface-variant uppercase">OR</span>
          <div className="h-[1px] flex-grow bg-outline-variant"></div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Login/Signup Tabs */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('SIGN_IN')}
              className={`font-data-mono py-1.5 uppercase text-[10px] text-center border transition-all ${
                activeTab === 'SIGN_IN'
                  ? 'border-accent-pop text-accent-pop font-bold bg-black'
                  : 'border-outline-variant text-on-surface-variant hover:text-accent-pop hover:border-accent-pop'
              }`}
            >
              SIGN IN
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('REGISTER')}
              className={`font-data-mono py-1.5 uppercase text-[10px] text-center border transition-all ${
                activeTab === 'REGISTER'
                  ? 'border-accent-pop text-accent-pop font-bold bg-black'
                  : 'border-outline-variant text-on-surface-variant hover:text-accent-pop hover:border-accent-pop'
              }`}
            >
              REGISTER
            </button>
          </div>

          {/* Email Input */}
          <div className="flex flex-col gap-1">
            <label className="font-label-caps text-[9px] text-on-surface-variant uppercase tracking-wider">
              EMAIL_ADDRESS
            </label>
            <input
              type="email"
              required
              placeholder="Enter your email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant p-2 font-data-mono text-xs text-accent-pop focus:outline-none focus:border-accent-pop"
            />
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-baseline">
              <label className="font-label-caps text-[9px] text-on-surface-variant uppercase tracking-wider">
                PASSWORD
              </label>
              {activeTab === 'SIGN_IN' && (
                <button
                  type="button"
                  onClick={() => console.log("Forgot password trigger...")}
                  className="font-data-mono text-[8px] text-on-surface-variant hover:text-accent-pop uppercase"
                >
                  FORGOT PASSWORD?
                </button>
              )}
            </div>
            <input
              type="password"
              required
              placeholder="Enter your password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant p-2 font-data-mono text-xs text-accent-pop focus:outline-none focus:border-accent-pop"
            />
          </div>

          {/* Email Authentication Action Button */}
          <button
            type="submit"
            className="w-full bg-accent-pop text-background font-data-mono py-3 font-bold hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase border-2 border-black neo-pop-active flex items-center justify-center gap-2 mt-2 text-xs"
          >
            <span className="material-symbols-outlined text-base">mail</span>
            <span>
              {activeTab === 'SIGN_IN' ? 'SIGN IN WITH EMAIL' : 'CREATE TACTICAL ACCOUNT'}
            </span>
          </button>
        </form>

        {/* Footer Policy and Terms */}
        <div className="flex flex-col gap-1 mt-2 text-center">
          <div className="h-[1px] w-full bg-outline-variant"></div>
          <p className="font-data-mono text-[8px] text-on-surface-variant uppercase tracking-wider leading-relaxed pt-2">
            BY SIGNING IN, YOU COMPLY WITH PHOSPHOR COCKPIT'S<br />
            <span className="text-accent-pop hover:underline cursor-pointer">TERMS_OF_SERVICE</span> &{' '}
            <span className="text-accent-pop hover:underline cursor-pointer">PRIVACY_POLICY</span>
          </p>
        </div>

      </div>
    </div>
  );
}
