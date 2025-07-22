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
import {
  ArrowLeft,
  ArrowRight,
  Users,
  FileSpreadsheet,
  Upload,
  Check,
  Download,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function UploadNames() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileSelect = (file: File) => {
    if (
      file &&
      (file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel" ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls"))
    ) {
      setSelectedFile(file);

      // Convert file to base64 and save to localStorage
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        localStorage.setItem("uploadedExcelFile", base64String);
        localStorage.setItem("uploadedNamesFile", file.name);
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
      navigate("/download");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary/10">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/preview-template">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-primary">
                Upload Recipient Names
              </h1>
              <p className="text-muted-foreground">Step 3 of 4</p>
            </div>
          </div>
          <Badge variant="outline" className="px-4 py-2">
            <Users className="h-4 w-4 mr-2" />
            Name Upload
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Upload Recipients List</CardTitle>
              <CardDescription>
                Upload an Excel file (.xlsx or .xls) with recipient names in
                column A. Simple format: just one name per row starting from row
                2.
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
                      <p className="text-sm text-green-600 mt-2">
                        Ready to process recipients
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
                      <p className="font-semibold">Drop your Excel file here</p>
                      <p className="text-sm text-muted-foreground">
                        or click to browse files
                      </p>
                    </div>
                    <Button onClick={() => fileInputRef.current?.click()}>
                      Select Excel File
                    </Button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>

              <div className="mt-6 space-y-3">
                <h4 className="font-semibold text-sm">Supported Formats:</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">XLSX</Badge>
                  <Badge variant="outline">XLS</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Maximum file size: 5MB. Ensure the first column contains
                  recipient names.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Instructions Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                File Format Guide
              </CardTitle>
              <CardDescription>
                Follow this format for best results when uploading your
                recipient list.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Sample Format */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">
                  Expected Excel Format:
                </h4>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 bg-gray-100 font-semibold w-16">
                          A
                        </th>
                        <th className="text-left p-2 bg-gray-100 font-semibold">
                          Name
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* <tr className="border-b">
                        <td className="p-2 text-gray-400 text-center">1</td>
                        <td className="p-2 font-semibold">Name</td>
                      </tr> */}
                      <tr className="border-b">
                        <td className="p-2 text-gray-400 text-center">1</td>
                        <td className="p-2">John Smith</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 text-gray-400 text-center">2</td>
                        <td className="p-2">Mary Johnson</td>
                      </tr>
                      <tr>
                        <td className="p-2 text-gray-400 text-center">3</td>
                        <td className="p-2">David Wilson</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Requirements */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Requirements:</h4>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Column A must contain recipient names
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Include header row with "Name" in cell A1
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    One name per row starting from row 2
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    No limit on number of recipients
                  </li>
                </ul>
              </div>

              {/* Download Sample */}
              <div className="space-y-3">
                {/* <h4 className="font-semibold text-sm">Need a template?</h4>
                <Button variant="outline" size="sm" className="w-full" disabled>
                  <Download className="h-4 w-4 mr-2" />
                  Download Sample Excel Template
                  <span className="ml-2 text-xs opacity-70">(Coming Soon)</span>
                </Button> */}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Continue Button */}
        <div className="flex justify-between mt-8">
          <div className="text-sm text-muted-foreground">
            {/* <p>✓ Template uploaded</p>
            <p>✓ Design customized</p>
            <p
              className={
                selectedFile ? "text-green-600" : "text-muted-foreground"
              }
            >
              {selectedFile
                ? "✓ Recipients uploaded"
                : "◦ Upload recipients list"}
            </p> */}
          </div>
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={!selectedFile}
            className="px-8"
          >
            Generate Certificates
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
