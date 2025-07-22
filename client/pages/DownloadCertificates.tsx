import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Download,
  CheckCircle,
  Archive,
  Home,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import JSZip from "jszip";

interface CertificateSettings {
  template: string;
  templateType: string;
  namePosition: { x: number; y: number };
  fontSize: number;
  fontFamily: string;
  textColor: string;
}

export default function DownloadCertificates() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [recipientNames, setRecipientNames] = useState<string[]>([]);
  const [certificateSettings, setCertificateSettings] =
    useState<CertificateSettings | null>(null);
  const [isReady, setIsReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    loadDataFromStorage();
  }, []);

  const loadDataFromStorage = async () => {
    try {
      // Load certificate settings
      const template = localStorage.getItem("uploadedTemplate");
      const templateType = localStorage.getItem("templateType") || "image";
      const settings = {
        template: template || "",
        templateType,
        namePosition: JSON.parse(
          localStorage.getItem("namePosition") || '{"x": 50, "y": 50}',
        ),
        fontSize: parseInt(localStorage.getItem("fontSize") || "24"),
        fontFamily: localStorage.getItem("fontFamily") || "serif",
        textColor: localStorage.getItem("textColor") || "#000000",
      };
      setCertificateSettings(settings);

      // Load Excel file and extract names
      const uploadedFile = localStorage.getItem("uploadedExcelFile");
      if (uploadedFile) {
        const names = await extractNamesFromExcel(uploadedFile);
        setRecipientNames(names);
      }

      setIsReady(!!template && !!uploadedFile);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const extractNamesFromExcel = async (
    base64File: string,
  ): Promise<string[]> => {
    try {
      // Convert base64 to array buffer
      const binaryString = atob(base64File.split(",")[1]);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Read Excel file
      const workbook = XLSX.read(bytes, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(firstSheet, {
        header: 1,
      }) as string[][];

      // Extract names (skip header row)
      const names = data
        .slice(1)
        .map((row) => row[0])
        .filter(
          (name) => name && typeof name === "string" && name.trim() !== "",
        );

      return names;
    } catch (error) {
      console.error("Error extracting names from Excel:", error);
      return [];
    }
  };

  const getFontFamily = (family: string) => {
    switch (family) {
      case "serif":
        return "ui-serif, Georgia, serif";
      case "sans":
        return "ui-sans-serif, Arial, sans-serif";
      case "mono":
        return "ui-monospace, 'Courier New', monospace";
      case "script":
        return "'Brush Script MT', cursive";
      case "display":
        return "'Impact', 'Arial Black', sans-serif";
      default:
        return "ui-serif, Georgia, serif";
    }
  };

  const generateCertificate = async (
    name: string,
    settings: CertificateSettings,
  ): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;

      // Set canvas size (A4 landscape at 300 DPI)
      canvas.width = 3508;
      canvas.height = 2480;

      if (settings.templateType === "image") {
        const img = new Image();
        img.onload = () => {
          // Draw template
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Add name text
          const x = (settings.namePosition.x / 100) * canvas.width;
          const y = (settings.namePosition.y / 100) * canvas.height;

          ctx.font = `${settings.fontSize * 4}px ${getFontFamily(settings.fontFamily)}`;
          ctx.fillStyle = settings.textColor;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          // Add text shadow
          ctx.shadowColor = "rgba(0,0,0,0.3)";
          ctx.shadowBlur = 8;
          ctx.shadowOffsetX = 4;
          ctx.shadowOffsetY = 4;

          ctx.fillText(name, x, y);

          canvas.toBlob((blob) => {
            resolve(blob!);
          }, "image/png");
        };
        img.src = settings.template;
      } else {
        // For PDF templates, create a simple certificate with the name
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = settings.textColor;
        ctx.font = `${settings.fontSize * 4}px ${getFontFamily(settings.fontFamily)}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const x = (settings.namePosition.x / 100) * canvas.width;
        const y = (settings.namePosition.y / 100) * canvas.height;

        ctx.fillText(name, x, y);

        canvas.toBlob((blob) => {
          resolve(blob!);
        }, "image/png");
      }
    });
  };

  const downloadCertificates = async () => {
    if (!certificateSettings || recipientNames.length === 0) return;

    setIsGenerating(true);
    setProgress(0);

    try {
      const zip = new JSZip();

      for (let i = 0; i < recipientNames.length; i++) {
        const name = recipientNames[i];
        const certificateBlob = await generateCertificate(
          name,
          certificateSettings,
        );

        // Add to zip with name as filename
        const fileName = `${name.replace(/[^a-zA-Z0-9\s]/g, "").trim()}.png`;
        zip.file(fileName, certificateBlob);

        // Update progress
        setProgress(Math.round(((i + 1) / recipientNames.length) * 100));
      }

      // Generate and download zip
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificates.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating certificates:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary/10">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/upload-names">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-primary">
                Download Certificates
              </h1>
              <p className="text-muted-foreground">Step 4 of 4</p>
            </div>
          </div>
          <Badge variant="outline" className="px-4 py-2">
            <Download className="h-4 w-4 mr-2" />
            Ready to Download
          </Badge>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Success Card */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-green-900">
                    {isReady
                      ? "Certificates Ready to Generate!"
                      : "Setting Up..."}
                  </CardTitle>
                  <CardDescription className="text-green-700">
                    {isReady
                      ? `Ready to generate ${recipientNames.length} certificates from your Excel file`
                      : "Loading your template and recipient data..."}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Download Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Generation Progress</CardTitle>
              <CardDescription>
                Your certificates have been generated with the custom template
                and recipient names
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>
                    {isGenerating
                      ? "Generating certificates..."
                      : "Ready to generate"}
                  </span>
                  <span>
                    {isGenerating
                      ? `${Math.round((progress / 100) * recipientNames.length)}/${recipientNames.length} Complete`
                      : `${recipientNames.length} recipients found`}
                  </span>
                </div>
                <Progress value={isGenerating ? progress : 0} className="h-2" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  className={`p-4 border rounded-lg ${certificateSettings?.template ? "bg-green-50" : "bg-gray-50"}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle
                      className={`h-4 w-4 ${certificateSettings?.template ? "text-green-600" : "text-gray-400"}`}
                    />
                    <span
                      className={`font-semibold ${certificateSettings?.template ? "text-green-900" : "text-gray-600"}`}
                    >
                      Template Ready
                    </span>
                  </div>
                  <p
                    className={`text-sm ${certificateSettings?.template ? "text-green-700" : "text-gray-500"}`}
                  >
                    {certificateSettings?.template
                      ? "Template loaded with custom positioning"
                      : "No template found"}
                  </p>
                </div>

                <div
                  className={`p-4 border rounded-lg ${recipientNames.length > 0 ? "bg-green-50" : "bg-gray-50"}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle
                      className={`h-4 w-4 ${recipientNames.length > 0 ? "text-green-600" : "text-gray-400"}`}
                    />
                    <span
                      className={`font-semibold ${recipientNames.length > 0 ? "text-green-900" : "text-gray-600"}`}
                    >
                      Recipients Loaded
                    </span>
                  </div>
                  <p
                    className={`text-sm ${recipientNames.length > 0 ? "text-green-700" : "text-gray-500"}`}
                  >
                    {recipientNames.length > 0
                      ? `${recipientNames.length} names ready for certificates`
                      : "No recipient names found"}
                  </p>
                </div>

                <div
                  className={`p-4 border rounded-lg ${isReady ? "bg-blue-50" : "bg-gray-50"}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Archive
                      className={`h-4 w-4 ${isReady ? "text-blue-600" : "text-gray-400"}`}
                    />
                    <span
                      className={`font-semibold ${isReady ? "text-blue-900" : "text-gray-600"}`}
                    >
                      Ready to Generate
                    </span>
                  </div>
                  <p
                    className={`text-sm ${isReady ? "text-blue-700" : "text-gray-500"}`}
                  >
                    {isReady
                      ? "All set for certificate generation"
                      : "Waiting for template and names"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Download Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                Download Your Certificates
              </CardTitle>
              <CardDescription>
                Choose your preferred download format. All certificates are
                high-quality and ready for printing or digital distribution.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  size="lg"
                  className="h-16 flex-col gap-2"
                  onClick={downloadCertificates}
                  disabled={!isReady || isGenerating}
                >
                  {isGenerating ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <Download className="h-6 w-6" />
                  )}
                  <div>
                    <div className="font-semibold">
                      {isGenerating ? "Generating..." : "Download ZIP File"}
                    </div>
                    <div className="text-xs opacity-80">
                      {isGenerating
                        ? `${progress}% complete`
                        : `${recipientNames.length} certificates`}
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="h-16 flex-col gap-2"
                  disabled
                >
                  <Archive className="h-6 w-6" />
                  <div>
                    <div className="font-semibold">Individual Downloads</div>
                    <div className="text-xs opacity-60">Coming soon</div>
                  </div>
                </Button>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">
                  What's included:
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>
                    • {recipientNames.length} personalized certificates in PNG
                    format (300 DPI)
                  </li>
                  <li>• Each file named with recipient's name</li>
                  <li>• Uses your custom template and positioning</li>
                  <li>• Compressed in a single ZIP file for easy download</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          {/* <Card>
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/" className="flex-1">
                  <Button variant="outline" className="w-full">
                    <Home className="h-4 w-4 mr-2" />
                    Create More Certificates
                  </Button>
                </Link>
                <Button className="flex-1" disabled>
                  Share Certificates via Email
                  <span className="ml-2 text-xs opacity-70">(Coming Soon)</span>
                </Button>
              </div>
            </CardContent>
          </Card> */}
        </div>

        {/* Final Progress */}
        {/* <div className="flex justify-center mt-8">
          <div className="text-sm text-muted-foreground text-center">
            <p>✓ Template uploaded</p>
            <p>✓ Design customized</p>
            <p>✓ Names processed</p>
            <p className="text-green-600 font-semibold">
              ✓ Certificates ready!
            </p>
          </div>
        </div> */}

        {/* Hidden canvas for certificate generation */}
        <canvas
          ref={canvasRef}
          style={{ display: "none" }}
          width={3508}
          height={2480}
        />
      </div>
    </div>
  );
}
