import React, { useState, useRef, useEffect } from 'react';

const F = { fontFamily: '"Roboto", sans-serif' };
const labelStyle  = { ...F, fontSize: 13, color: '#212121', display: 'block', marginBottom: 6 };
const subtextStyle = { ...F, fontSize: 12, color: '#757575', display: 'block', marginTop: 2 };

/* ─── Drawer shell ─── */
function NativeDrawer({ isOpen, onClose, children }) {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)' }} />
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative', width: 650, maxWidth: '95vw',
          height: '100%', overflowY: 'auto',
          background: '#fff', boxShadow: '-4px 0 24px rgba(0,0,0,0.14)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* ─── StyledSelect ─── */
function StyledSelect({ value, onChange, options, placeholder, disabled }) {
  return (
    <div style={{ position: 'relative' }}>
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        style={{
          ...F, fontSize: 13, color: value ? '#212121' : '#9e9e9e',
          height: 36, width: '100%', paddingLeft: 12, paddingRight: 32,
          border: '1px solid #c5cad3', borderRadius: 4,
          background: '#fff', appearance: 'none', cursor: disabled ? 'default' : 'pointer',
        }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <span className="material-symbols-outlined" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: '#757575', pointerEvents: 'none' }}>
        expand_more
      </span>
    </div>
  );
}

/* ─── Radio ─── */
function Radio({ checked, onChange, label, disabled }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: disabled ? 'default' : 'pointer', ...F, fontSize: 13, color: '#212121' }}>
      <div onClick={() => !disabled && onChange()} style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, border: checked ? '5px solid #1976d2' : '2px solid #9e9e9e', background: '#fff', cursor: disabled ? 'default' : 'pointer', boxSizing: 'border-box' }} />
      {label}
    </label>
  );
}

/* ─── Checkbox ─── */
function Checkbox({ checked, onChange, label, disabled }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: disabled ? 'default' : 'pointer', ...F, fontSize: 13, color: '#212121' }}>
      <div
        onClick={() => !disabled && onChange(!checked)}
        style={{ width: 18, height: 18, borderRadius: 3, flexShrink: 0, boxSizing: 'border-box', border: checked ? 'none' : '2px solid #9e9e9e', background: checked ? '#1976d2' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: disabled ? 'default' : 'pointer' }}
      >
        {checked && <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#fff', lineHeight: 1 }}>check</span>}
      </div>
      {label}
    </label>
  );
}

/* ─── Phone number chip field ─── */
function PhoneChip({ onRemove, disabled }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, height: 26, padding: '0 8px', border: '1px solid #1976d2', borderRadius: 4, background: '#fff', ...F, fontSize: 13, color: '#1565c0' }}>
      <span style={{ fontSize: 13, color: '#1976d2' }}>{'{}'}</span>
      Contact.PhoneNumber
      {!disabled && (
        <span className="material-symbols-outlined" onClick={onRemove} style={{ fontSize: 14, color: '#9e9e9e', cursor: 'pointer', marginLeft: 2 }}>close</span>
      )}
    </span>
  );
}

/* ─── Message textarea with variable hint ─── */
function MessageField({ label, value, onChange, placeholder, disabled }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ border: '1px solid #c5cad3', borderRadius: 4, padding: '8px 10px', minHeight: 90, background: '#fff' }}>
        <textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          readOnly={disabled}
          style={{ ...F, fontSize: 13, color: '#212121', width: '100%', border: 'none', outline: 'none', resize: 'none', background: 'transparent', minHeight: 60 }}
        />
        <div style={{ marginTop: 4, ...F, fontSize: 12, color: '#9e9e9e' }}>{'{x}'}</div>
      </div>
    </div>
  );
}

/* ─── Options ─── */
const TIME_OPTIONS = [
  '6:00 AM','6:30 AM','7:00 AM','7:30 AM','8:00 AM','8:30 AM',
  '9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM',
  '12:00 PM','12:30 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM',
  '5:00 PM','6:00 PM','7:00 PM','8:00 PM','9:00 PM','9:30 PM','10:00 PM',
].map((t) => ({ value: t, label: t }));

const ATTEMPT_OPTIONS = Array.from({ length: 5 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }));
const INTERVAL_OPTIONS = Array.from({ length: 48 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }));
const INTERVAL_UNIT_OPTIONS = [
  { value: 'Minutes', label: 'Minutes' },
  { value: 'Hours',   label: 'Hours' },
  { value: 'Days',    label: 'Days' },
];

/* ─── Main ─── */
export default function VoiceCallToolDrawer({ isOpen, onClose }) {
  const [hasPhoneChip,   setHasPhoneChip]   = useState(true);
  const [callFrom,       setCallFrom]       = useState('');
  const [callMode,       setCallMode]       = useState('subagent');
  const [selectedAgent,  setSelectedAgent]  = useState('frontdesk-north');
  const [initialMessage, setInitialMessage] = useState('');
  const [callingWindow,  setCallingWindow]  = useState('custom');
  const [windowFrom,     setWindowFrom]     = useState('9:00 AM');
  const [windowTo,       setWindowTo]       = useState('10:00 PM');
  const [retryNoAnswer,  setRetryNoAnswer]  = useState(true);
  const [retryRejected,  setRetryRejected]  = useState(false);
  const [retryVoicemail, setRetryVoicemail] = useState(true);
  const [maxAttempts,    setMaxAttempts]    = useState('2');
  const [retryInterval,  setRetryInterval]  = useState('24');
  const [retryUnit,      setRetryUnit]      = useState('Hours');
  const [voicemailMsg,   setVoicemailMsg]   = useState('');

  const gap = { display: 'flex', flexDirection: 'column', gap: 16 };

  return (
    <NativeDrawer isOpen={isOpen} onClose={onClose}>
      {/* Sticky header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button type="button" onClick={onClose} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#555', borderRadius: 4, padding: 0 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5.99 10.627L8.733 13.37c.124.124.185.27.184.536s-.062.617-.184.748c-.13.13-.278.196-.446.2-.168.005-.317-.058-.446-.188L3.109 10.53C2.958 10.378 2.883 10.203 2.883 10c0-.202.075-.378.226-.529L6.84 5.742c.124-.124.271-.185.441-.184.17.002.32.068.449.197.12.129.183.275.188.439.004.163-.059.31-.188.44L5.99 9.377H15.793c.178 0 .326.06.446.179.12.12.179.268.179.446s-.06.326-.179.446c-.12.12-.268.179-.446.179H5.99z" fill="currentColor"/>
            </svg>
          </button>
          <span style={{ ...F, fontSize: 18, color: '#212121' }}>Initiate voice call</span>
        </div>
        <button type="button" onClick={onClose} style={{ ...F, fontSize: 14, height: 36, padding: '0 20px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          Save
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: '8px 24px 48px', ...gap }}>

        {/* Phone number */}
        <div>
          <label style={labelStyle}>Phone number</label>
          <div style={{ minHeight: 36, border: '1px solid #c5cad3', borderRadius: 4, padding: '4px 8px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6, background: '#fff' }}>
            {hasPhoneChip
              ? <PhoneChip onRemove={() => setHasPhoneChip(false)} />
              : <span style={{ ...F, fontSize: 13, color: '#9e9e9e' }}>Add variable…</span>
            }
          </div>
        </div>

        {/* Call from */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
            <span style={{ ...F, fontSize: 13, color: '#212121' }}>Call from</span>
            <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#9e9e9e' }}>info</span>
          </div>
          <StyledSelect value={callFrom} onChange={setCallFrom} placeholder="Select" options={[
            { value: 'location-number', label: 'Location number' },
            { value: 'main-number',     label: 'Main number' },
          ]} />
        </div>

        {/* Call mode */}
        <div style={gap}>
          <div style={{ display: 'flex', gap: 24 }}>
            <Radio checked={callMode === 'subagent'}   onChange={() => setCallMode('subagent')}   label="Call sub-agent" />
            <Radio checked={callMode === 'procedures'} onChange={() => setCallMode('procedures')} label="Follow procedures" />
          </div>

          {callMode === 'subagent' && (
            <>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                  <span style={{ ...F, fontSize: 13, color: '#212121' }}>Select agent</span>
                  <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#9e9e9e' }}>info</span>
                </div>
                <StyledSelect value={selectedAgent} onChange={setSelectedAgent} options={[
                  { value: 'frontdesk-north', label: 'Front desk agent North region' },
                  { value: 'frontdesk-south', label: 'Front desk agent South region' },
                ]} />
              </div>
              <MessageField label="Configure initial message" value={initialMessage} onChange={setInitialMessage} placeholder="Enter your message here" />
            </>
          )}
        </div>

        {/* Calling window */}
        <div style={gap}>
          <div>
            <label style={labelStyle}>Calling window</label>
            <div style={{ display: 'flex', gap: 24 }}>
              <Radio checked={callingWindow === 'business'} onChange={() => setCallingWindow('business')} label="During business hours" />
              <Radio checked={callingWindow === 'custom'}   onChange={() => setCallingWindow('custom')}   label="Custom range" />
            </div>
          </div>
          {callingWindow === 'custom' && (
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>From</label>
                <StyledSelect value={windowFrom} onChange={setWindowFrom} options={TIME_OPTIONS} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>To</label>
                <StyledSelect value={windowTo} onChange={setWindowTo} options={TIME_OPTIONS} />
              </div>
            </div>
          )}
        </div>

        {/* Retry settings */}
        <div style={gap}>
          <div>
            <label style={labelStyle}>Retry settings</label>
            <span style={subtextStyle}>Enable automatic retry if customer does not connect on the first attempt</span>
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            <Checkbox checked={retryNoAnswer}  onChange={setRetryNoAnswer}  label="No answer" />
            <Checkbox checked={retryRejected}  onChange={setRetryRejected}  label="Call rejected" />
            <Checkbox checked={retryVoicemail} onChange={setRetryVoicemail} label="Voice mail" />
          </div>
          <div>
            <label style={labelStyle}>Max attempts</label>
            <div style={{ width: 160 }}>
              <StyledSelect value={maxAttempts} onChange={setMaxAttempts} options={ATTEMPT_OPTIONS} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Interval between retries</label>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ width: 160 }}>
                <StyledSelect value={retryInterval} onChange={setRetryInterval} options={INTERVAL_OPTIONS} />
              </div>
              <div style={{ flex: 1 }}>
                <StyledSelect value={retryUnit} onChange={setRetryUnit} options={INTERVAL_UNIT_OPTIONS} />
              </div>
            </div>
          </div>
        </div>

        {/* Voicemail message */}
        <MessageField label="Configure voice mail message" value={voicemailMsg} onChange={setVoicemailMsg} placeholder="Enter your message here" />

      </div>
    </NativeDrawer>
  );
}
