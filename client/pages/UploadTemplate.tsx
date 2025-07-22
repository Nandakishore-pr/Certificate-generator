import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileImage, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function UploadTemplate() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileSelect = (file: File) => {
    if (
      file &&
      (file.type.startsWith("image/") || file.type === "application/pdf")
    ) {
      setSelectedFile(file);

      let extension = "unknown";
      if (file.type === "image/png") extension = "png";
      else if (file.type === "image/jpeg") extension = "jpg";
      else if (file.type === "image/webp") extension = "webp";
      else if (file.type === "application/pdf") extension = "pdf";

      localStorage.setItem("templateExtension", extension);

      const reader = new FileReader();

      reader.onload = () => {
        const base64String = reader.result as string;
        localStorage.setItem("uploadedTemplate", base64String);

        if (file.type.startsWith("image/")) {
          setPreviewUrl(URL.createObjectURL(file));
          localStorage.setItem("templateType", "image");
        } else if (file.type === "application/pdf") {
          setPreviewUrl(""); // You can handle PDF preview if needed
          localStorage.setItem("templateType", "pdf");
        }
      };

      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleContinue = () => {
    if (selectedFile) {
      // In a real app, you'd save the file to state management or upload to server
      navigate("/preview-template");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary/10">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-primary">
                Upload Certificate Template
              </h1>
              <p className="text-muted-foreground">Step 1 of 4</p>
            </div>
          </div>
          <Badge variant="outline" className="px-4 py-2">
            <FileImage className="h-4 w-4 mr-2" />
            Template Upload
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Choose Your Template</CardTitle>
              <CardDescription>
                Upload a certificate template in JPG or PNG format. This
                will be the base design for all your certificates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                  isDragOver
                    ? "border-primary bg-primary/5"
                    : selectedFile
                      ? "border-green-500 bg-green-50"
                      : "border-muted-foreground/25 hover:border-primary/50"
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {selectedFile ? (
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-700">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-4"
                    >
                      Choose Different File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Drop your template here</p>
                      <p className="text-sm text-muted-foreground">
                        or click to browse files
                      </p>
                    </div>
                    <Button onClick={() => fileInputRef.current?.click()}>
                      Select Template File
                    </Button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>

              <div className="mt-6 space-y-3">
                <h4 className="font-semibold text-sm">Supported Formats:</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">JPG</Badge>
                  <Badge variant="outline">PNG</Badge>
                  {/* <Badge variant="outline">PDF</Badge> */}
                </div>
                <p className="text-xs text-muted-foreground">
                  Maximum file size: 10MB. For best results, use high-resolution
                  images (300 DPI or higher).
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Preview Section */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                This is how your template will appear. You'll be able to
                customize text placement in the next step.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-muted/50 min-h-[400px] flex items-center justify-center">
                {previewUrl ? (
                  <div className="w-full h-full max-w-md">
                    <img
                      src={previewUrl}
                      alt="Template preview"
                      className="w-full h-auto rounded shadow-lg"
                    />
                  </div>
                ) : selectedFile?.type === "application/pdf" ? (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                      <FileImage className="h-8 w-8 text-red-600" />
                    </div>
                    <div>
                      <p className="font-semibold">PDF Template Selected</p>
                      <p className="text-sm text-muted-foreground">
                        PDF preview will be available in the next step
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                      <FileImage className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">
                      Upload a template to see preview
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Continue Button */}
        <div className="flex justify-end mt-8">
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={!selectedFile}
            className="px-8"
          >
            Continue to Customization
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}