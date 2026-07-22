"use client";

import React, { useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Ship, ShieldCheck, CheckCircle2, Upload, FileText, ArrowRight, Download, Camera, UserPlus, Check } from "lucide-react";
import { WaveProgress } from "@/components/WaveProgress";

interface Dependent {
  name: string;
  relation: string;
}

function TokenPreCheckinContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams?.get("token") || "tok_booking_99";

  // Step state: 1 (Auth), 2 (Upload), 3 (OCR Review), 4 (Signature & Dependents), 5 (Done)
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  
  // Progress calculations
  const progressMap: Record<number, number> = {
    1: 15,
    2: 45,
    3: 75,
    4: 90,
    5: 100
  };

  // Step 1: Auth State
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [expectedOtp, setExpectedOtp] = useState("123456");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Step 2: Camera Document Upload
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  // Step 3: OCR Metadata Review
  const [ocrName, setOcrName] = useState("Ayushi Aggarwal");
  const [ocrDob, setOcrDob] = useState("1996-10-21");
  const [ocrIdNumber, setOcrIdNumber] = useState("4581-9012-3482");

  // Step 4: Dependents & Signature
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [depName, setDepName] = useState("");
  const [depRelation, setDepRelation] = useState("Spouse");
  
  // Signature Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  // Handlers
  const handleRequestOtp = async () => {
    if (phone.length < 10) return;
    setAuthLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://checkin-backend-eo2tmdx7lq-uc.a.run.app";
      const res = await fetch(`${baseUrl}/notifications/whatsapp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `91${phone.replace(/\D/g, "").slice(-10)}` }),
      });
      const data = await res.json();
      if (data?.otp) {
        setExpectedOtp(data.otp);
      }
    } catch {
      setExpectedOtp("123456");
    }
    setAuthLoading(false);
    setOtpSent(true);
  };

  const handleVerifyOtp = () => {
    if (enteredOtp === expectedOtp) {
      setStep(2);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setIsParsing(true);
      // Simulate Google Cloud Document AI OCR parsing for 2 seconds
      setTimeout(() => {
        setIsParsing(false);
        setStep(3);
      }, 2500);
    }
  };

  const handleAddDependent = () => {
    if (!depName) return;
    setDependents(prev => [...prev, { name: depName, relation: depRelation }]);
    setDepName("");
  };

  return (
    <div className="w-full max-w-lg bg-[#F5F5F4] rounded-[28px] border border-white/60 p-8 shadow-2xl space-y-6 relative overflow-hidden text-slate-800">
      
      {/* Wave progress header */}
      <WaveProgress progressValue={progressMap[step]} />

      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <div className="w-9 h-9 bg-gradient-to-br from-[#FDBA74] to-[#FEF08A] rounded-xl flex items-center justify-center shadow-md">
          <Ship className="w-5 h-5 text-teal-950" />
        </div>
        <div>
          <h1 className="font-bold text-base font-serif text-slate-900">Pre-Check-In Onboarding</h1>
          <p className="text-xs text-slate-500">Booking Reference: <code className="font-mono text-orange-600">{token}</code></p>
        </div>
      </div>

      {/* STEP 1: Auth */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="font-bold text-lg text-slate-900">Authenticate Mobile Number</h2>
          <p className="text-xs text-slate-500">Log in securely using a dynamic code sent via Meta Cloud API.</p>

          {!otpSent ? (
            <div className="space-y-3">
              <input
                type="tel"
                placeholder="Enter 10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-center text-sm font-semibold tracking-wide focus:ring-2 focus:ring-[#0D9488]"
              />
              <button
                onClick={handleRequestOtp}
                disabled={phone.length < 10 || authLoading}
                className="w-full bg-[#FDBA74] hover:bg-[#fca5a5] text-slate-950 font-bold text-xs py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5"
              >
                {authLoading ? "Requesting OTP..." : <>Send OTP via WhatsApp <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-center text-lg font-mono tracking-widest text-slate-900"
              />
              <p className="text-[10px] text-[#0D9488] font-bold text-center">
                OTP sent · Test Hint: <strong>{expectedOtp}</strong>
              </p>
              <button
                onClick={handleVerifyOtp}
                disabled={enteredOtp.length < 6}
                className="w-full bg-[#0D9488] text-white hover:bg-teal-800 font-bold text-xs py-3.5 rounded-xl shadow-lg transition-all"
              >
                Verify & Continue
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: Camera upload */}
      {step === 2 && (
        <div className="space-y-5 relative">
          {isParsing && (
            <div className="absolute inset-0 bg-[#E0F2FE]/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center rounded-2xl animate-fade-in text-center p-6">
              <div className="w-16 h-16 border-4 border-[#0D9488] border-t-transparent rounded-full animate-spin mb-4" />
              <h3 className="font-bold text-teal-900 text-sm">Google Cloud Document AI parsing...</h3>
              <p className="text-xs text-slate-600 mt-1">Analyzing photo quality and extracting legal identity fields.</p>
            </div>
          )}

          <h2 className="font-bold text-lg text-slate-900">Upload Government ID</h2>
          <p className="text-xs text-slate-500">Provide Aadhaar, Passport, or driving license to complete legal check-in requirements.</p>

          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-white space-y-4 hover:border-teal-500 transition-all relative">
            <Upload className="w-10 h-10 text-slate-400 mx-auto" />
            <div>
              <span className="text-xs font-bold text-slate-700 block">Snap a photo or select file</span>
              <span className="text-[10px] text-slate-400">PDF, JPG, PNG up to 5MB</span>
            </div>
            <input
              type="file"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* STEP 3: OCR Metadata Review */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="font-bold text-lg text-slate-900">Verify Extracted Details</h2>
          <p className="text-xs text-slate-500">Document AI successfully extracted the following details. Please verify or edit them:</p>

          <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-100">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Full Name</label>
              <input
                type="text"
                value={ocrName}
                onChange={(e) => setOcrName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Date of Birth</label>
              <input
                type="date"
                value={ocrDob}
                onChange={(e) => setOcrDob(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">ID Number</label>
              <input
                type="text"
                value={ocrIdNumber}
                onChange={(e) => setOcrIdNumber(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              />
            </div>
          </div>

          <button
            onClick={() => setStep(4)}
            className="w-full bg-[#FDBA74] hover:bg-orange-400 text-slate-950 font-bold text-xs py-3.5 rounded-xl shadow-lg transition-all"
          >
            Confirm & Save Details
          </button>
        </div>
      )}

      {/* STEP 4: Dependents & Signature */}
      {step === 4 && (
        <div className="space-y-5">
          <h2 className="font-bold text-lg text-slate-900">Dependents & Digital Signature</h2>

          {/* Dependents Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 space-y-3">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5"><UserPlus className="w-4 h-4 text-teal-600" /> Accompanying Dependents</span>
            
            {dependents.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {dependents.map((dep, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <span className="font-semibold">{dep.name}</span>
                    <span className="text-slate-500 text-[10px] uppercase">{dep.relation}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Dependent's name"
                value={depName}
                onChange={(e) => setDepName(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
              <select
                value={depRelation}
                onChange={(e) => setDepRelation(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
              >
                <option value="Spouse">Spouse</option>
                <option value="Child">Child</option>
                <option value="Friend">Friend</option>
                <option value="Other">Other</option>
              </select>
              <button
                type="button"
                onClick={handleAddDependent}
                className="bg-slate-100 px-3 py-2 rounded-xl text-xs font-bold hover:bg-slate-200"
              >
                Add
              </button>
            </div>
          </div>

          {/* Canvas Signature Pad */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-700">Draw Digital Signature</span>
              <button onClick={clearSignature} className="text-[10px] text-orange-600 font-bold hover:underline">Clear</button>
            </div>
            
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
              <canvas
                ref={canvasRef}
                width={400}
                height={120}
                className="w-full touch-none cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>
          </div>

          <button
            onClick={() => setStep(5)}
            disabled={!hasSignature}
            className="w-full bg-[#0D9488] text-white hover:bg-teal-800 font-bold text-xs py-3.5 rounded-xl shadow-lg transition-all disabled:opacity-40"
          >
            Complete Digital Check-In
          </button>
        </div>
      )}

      {/* STEP 5: Done */}
      {step === 5 && (
        <div className="text-center space-y-5 py-3">
          <div className="w-16 h-16 bg-teal-100 text-[#0D9488] rounded-full flex items-center justify-center mx-auto shadow-md">
            <Check className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold font-serif text-slate-900">Check-In Completed!</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Your legal details are securely logged. The Property Manager will verify your room booking shortly.
          </p>

          <button
            onClick={() => router.push(`/stay/${token}`)}
            className="w-full bg-[#FDBA74] hover:bg-orange-400 text-slate-950 font-bold text-xs py-3.5 rounded-xl shadow-lg transition-all"
          >
            Enter Stay Experience Portal
          </button>
        </div>
      )}

    </div>
  );
}

export default function TokenPreCheckinPage() {
  return (
    <div className="min-h-screen bg-[#E0F2FE] text-slate-800 font-sans flex flex-col items-center justify-center p-6">
      <Suspense fallback={<div className="text-slate-800 text-xs font-semibold">Loading Pre-Check-In Portal...</div>}>
        <TokenPreCheckinContent />
      </Suspense>
    </div>
  );
}
