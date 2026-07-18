"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, UploadCloud, AlertCircle, FileText, CheckCircle, ArrowRight, UserCheck } from "lucide-react";

export default function KycVerification() {
  const router = useRouter();
  const [docType, setDocType] = useState("Aadhaar");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"IDLE" | "UPLOADING" | "PROCESSING" | "SUCCESS">("IDLE");
  const [ocrData, setOcrData] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setStatus("UPLOADING");
    
    // Simulate GCS Pre-signed upload delay
    setTimeout(() => {
      setStatus("PROCESSING");
      
      // Simulate Document AI OCR parsing delay
      setTimeout(() => {
        setStatus("SUCCESS");
        setOcrData({
          name: "Aditya Kumar",
          dob: "1996-10-21",
          idNumber: "XXXX-XXXX-8912",
          matchStatus: "98% Match (Auto-Verified)",
        });
      }, 1500);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#E5E7E6] text-[#1C2D37] flex flex-col items-center justify-center p-6 font-sans">
      {/* Sun glow header */}
      <div className="absolute top-12 flex flex-col items-center select-none pointer-events-none opacity-90">
        <div className="w-16 h-16 bg-gradient-to-t from-[#E76F51] to-[#F4A261] rounded-full shadow-lg shadow-[#E76F51]/20 animate-pulse" />
        <span className="text-[11px] uppercase tracking-[0.2em] font-medium text-[#1C2D37]/60 mt-3">Traces Secure ID Vault</span>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center mt-20 relative z-10">
        {/* Left Side Info Panel */}
        <div className="md:col-span-5 flex flex-col justify-center text-center md:text-left pr-4">
          <div className="flex justify-center md:justify-start items-center gap-3 mb-4">
            <ShieldCheck className="text-[#2A9D8F] w-8 h-8 animate-pulse" />
            <span className="h-[2px] w-12 bg-[#2A9D8F]/30" />
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight font-serif text-[#1C2D37] mb-4">
            Identity <span className="text-[#E76F51]">Verification</span>
          </h1>
          <p className="text-sm md:text-base text-[#1C2D37]/70 leading-relaxed mb-6">
            We use secure bank-grade encryption to scan your credentials. Upload your ID proof; our Document AI engine will auto-verify the details to complete your check-in card in under 10 seconds.
          </p>
          <div className="bg-[#F7F5F0] border border-[#1C2D37]/10 rounded-2xl p-4 flex gap-3 text-xs text-[#1C2D37]/75">
            <AlertCircle className="text-[#F4A261] w-5 h-5 shrink-0" />
            <p>
              Your physical ID proof is required in original by local regulations during property check-in. Uploading it here accelerates the check-in queue on arrival.
            </p>
          </div>
        </div>

        {/* Right Side Upload Canvas */}
        <div className="md:col-span-7 bg-[#F7F5F0] border border-white/40 shadow-xl rounded-[28px] p-8 glassmorphism relative overflow-hidden transition-all duration-300">
          <h2 className="text-xl font-medium tracking-tight mb-6">Upload Document</h2>

          {status === "IDLE" && (
            <div className="space-y-6">
              {/* Doc Type Selector */}
              <div className="flex gap-3">
                {["Aadhaar", "Passport", "Driver's License"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setDocType(type)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
                      docType === type
                        ? "bg-[#1C2D37] text-white border-transparent"
                        : "bg-white/60 border-[#1C2D37]/10 hover:bg-white text-[#1C2D37]/70"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Upload Dropzone */}
              <label className="border-2 border-dashed border-[#1C2D37]/15 hover:border-[#E76F51]/50 bg-white/40 hover:bg-white/70 transition-all rounded-[20px] p-8 flex flex-col items-center justify-center cursor-pointer text-center group">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <UploadCloud className="w-10 h-10 text-[#1C2D37]/30 group-hover:text-[#E76F51] transition-all mb-4" />
                <span className="text-sm font-medium">
                  {selectedFile ? selectedFile.name : "Select your ID file (JPG, PNG or PDF)"}
                </span>
                <span className="text-xs text-[#1C2D37]/45 mt-2">Maximum file size: 8 MB</span>
              </label>

              {/* Action Trigger */}
              <button
                type="button"
                onClick={handleUpload}
                disabled={!selectedFile}
                className="w-full bg-[#E76F51] text-white py-3.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#d85c3e] transition-all active:scale-[0.98] shadow-lg shadow-[#E76F51]/20 disabled:opacity-50 disabled:pointer-events-none"
              >
                Scan and Submit Document
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {(status === "UPLOADING" || status === "PROCESSING") && (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
              {/* Spinner & Boat animation */}
              <div className="relative">
                <div className="w-20 h-20 border-4 border-[#2A9D8F]/20 border-t-[#2A9D8F] rounded-full animate-spin" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl animate-bounce">
                  🛶
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-[#1C2D37]">
                  {status === "UPLOADING" ? "Uploading to secure vault..." : "Document AI parsing fields..."}
                </h3>
                <p className="text-xs text-[#1C2D37]/65 mt-2">
                  {status === "UPLOADING" ? "Encrypting file with KMS..." : "Running OCR scans & name-match alignments..."}
                </p>
              </div>
            </div>
          )}

          {status === "SUCCESS" && (
            <div className="space-y-6">
              {/* Success Banner */}
              <div className="bg-[#2A9D8F]/10 border border-[#2A9D8F]/20 rounded-2xl p-5 flex gap-4">
                <CheckCircle className="text-[#2A9D8F] w-6 h-6 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm text-[#2A9D8F]">Verification Successful!</h4>
                  <p className="text-xs text-[#1C2D37]/70 mt-1">
                    Document AI successfully extracted ID details matching your profile reservation.
                  </p>
                </div>
              </div>

              {/* Extracted Details card */}
              <div className="bg-white/60 border border-[#1C2D37]/5 rounded-2xl p-5 space-y-3.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#1C2D37]/40 block mb-1">OCR Extracted Details</span>
                <div className="flex justify-between items-center text-xs border-b border-[#1C2D37]/5 pb-2.5">
                  <span className="text-[#1C2D37]/60">Full Name</span>
                  <span className="font-semibold text-[#1C2D37]">{ocrData.name}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-b border-[#1C2D37]/5 pb-2.5">
                  <span className="text-[#1C2D37]/60">Date of Birth</span>
                  <span className="font-semibold text-[#1C2D37]">{ocrData.dob}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-b border-[#1C2D37]/5 pb-2.5">
                  <span className="text-[#1C2D37]/60">Document Number</span>
                  <span className="font-semibold text-[#1C2D37]">{ocrData.idNumber}</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-1">
                  <span className="text-[#1C2D37]/60">Audit Verification</span>
                  <span className="font-bold text-[#2A9D8F] flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5" />
                    {ocrData.matchStatus}
                  </span>
                </div>
              </div>

              {/* Next Steps Trigger */}
              <button
                type="button"
                onClick={() => router.push("/")}
                className="w-full bg-[#1C2D37] text-white py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#253945] transition-all active:scale-[0.98] shadow-lg shadow-[#1C2D37]/10"
              >
                Go to Dashboard Home
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
