import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, ArrowRight, Settings, Type, Move } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function PreviewTemplate() {
  const [namePosition, setNamePosition] = useState({ x: 50, y: 50 });
  const [fontSize, setFontSize] = useState([24]);
  const [fontFamily, setFontFamily] = useState("serif");
  const [textColor, setTextColor] = useState("#000000");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedTemplate, setUploadedTemplate] = useState<string>("");
  const [templateType, setTemplateType] = useState<string>("image");
  const previewRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Load uploaded template from localStorage on component mount
  useEffect(() => {
    const savedTemplate = localStorage.getItem("uploadedTemplate");
    const savedType = localStorage.getItem("templateType") || "image";
    console.log(
      "Saved template:",
      savedTemplate ? "Found" : "Not found",
      "Type:",
      savedType,
    );
    if (savedTemplate) {
      setUploadedTemplate(savedTemplate);
      setTemplateType(savedType);
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updatePosition(e);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      updatePosition(e);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updatePosition = (e: React.MouseEvent) => {
    if (previewRef.current) {
      const rect = previewRef.current.getBoundingClientRect();
      const x = Math.max(
        0,
        Math.min(100, ((e.clientX - rect.left) / rect.width) * 100),
      );
      const y = Math.max(
        0,
        Math.min(100, ((e.clientY - rect.top) / rect.height) * 100),
      );
      setNamePosition({ x, y });
    }
  };

  const fontFamilies = [
    { value: "serif", label: "Serif (Times New Roman)" },
    { value: "sans", label: "Sans Serif (Arial)" },
    { value: "mono", label: "Monospace (Courier)" },
    { value: "script", label: "Script (Cursive)" },
    { value: "display", label: "Display (Impact)" },
  ];

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary/10">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/upload-template">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-primary">
                Customize Template
              </h1>
              <p className="text-muted-foreground">Step 2 of 4</p>
            </div>
          </div>
          <Badge variant="outline" className="px-4 py-2">
            <Settings className="h-4 w-4 mr-2" />
            Design Customization
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Preview Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-5 w-5" />
                  Template Preview
                </CardTitle>
                <CardDescription>
                  Drag the sample name to position it on your certificate. The
                  actual names will appear in this exact position.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  ref={previewRef}
                  className="relative border rounded-lg bg-white shadow-lg aspect-[4/3] cursor-crosshair overflow-hidden"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  {/* Display uploaded template or fallback */}
                  {uploadedTemplate ? (
                    <div className="absolute inset-0">
                      {templateType === "pdf" ? (
                        <iframe
                          src={`${uploadedTemplate}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                          className="w-full h-full border-0"
                          style={{ pointerEvents: "none" }}
                          title="Certificate template"
                        />
                      ) : (
                        <img
                          src={uploadedTemplate}
                          alt="Certificate template"
                          className="w-full h-full object-contain bg-white"
                          onError={() => {
                            console.error("Failed to load template image");
                            setUploadedTemplate("");
                          }}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300">
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                          <Type className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-700">
                            No Template Found
                          </p>
                          <p className="text-sm text-gray-500">
                            Please go back and upload a certificate template
                            first
                          </p>
                        </div>
                        <Link to="/upload-template">
                          <Button variant="outline" size="sm">
                            Upload Template
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Draggable name placeholder - always show John Doe */}
                  <div
                    className="absolute select-none z-10"
                    style={{
                      left: `${namePosition.x}%`,
                      top: `${namePosition.y}%`,
                      transform: "translate(-50%, -50%)",
                      fontSize: `${fontSize[0]}px`,
                      fontFamily: getFontFamily(fontFamily),
                      color: textColor,
                      cursor: isDragging ? "grabbing" : "grab",
                      textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                    }}
                  >
                    John Doe
                  </div>

                  {/* Position indicator */}
                  <div
                    className="absolute w-2 h-2 bg-primary border-2 border-white rounded-full shadow-lg pointer-events-none"
                    style={{
                      left: `${namePosition.x}%`,
                      top: `${namePosition.y}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <Move className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-900">
                        How to position the name:
                      </p>
                      <p className="text-sm text-blue-700">
                        Click and drag anywhere on the certificate to position
                        where recipient names should appear. The blue dot shows
                        the current position.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Text Styling</CardTitle>
                <CardDescription>
                  Customize how recipient names will appear on the certificates.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Font Size */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">
                    Font Size: {fontSize[0]}px
                  </Label>
                  <Slider
                    value={fontSize}
                    onValueChange={setFontSize}
                    max={48}
                    min={12}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>12px</span>
                    <span>48px</span>
                  </div>
                </div>

                {/* Font Family */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Font Family</Label>
                  <Select value={fontFamily} onValueChange={setFontFamily}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontFamilies.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          {font.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Text Color */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Text Color</Label>
                  <div className="flex gap-3">
                    <Input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-16 h-10 rounded border cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="flex-1"
                      placeholder="#000000"
                    />
                  </div>
                </div>

                {/* Position Info */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Position</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        X Position
                      </Label>
                      <Input
                        type="number"
                        value={Math.round(namePosition.x)}
                        onChange={(e) =>
                          setNamePosition((prev) => ({
                            ...prev,
                            x: Number(e.target.value),
                          }))
                        }
                        min="0"
                        max="100"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Y Position
                      </Label>
                      <Input
                        type="number"
                        value={Math.round(namePosition.y)}
                        onChange={(e) =>
                          setNamePosition((prev) => ({
                            ...prev,
                            y: Number(e.target.value),
                          }))
                        }
                        min="0"
                        max="100"
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Presets */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Positions</CardTitle>
                <CardDescription>
                  Common certificate name positions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setNamePosition({ x: 50, y: 40 })}
                  >
                    Top Center
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setNamePosition({ x: 50, y: 50 })}
                  >
                    Center
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setNamePosition({ x: 50, y: 65 })}
                  >
                    Lower Center
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setNamePosition({ x: 50, y: 75 })}
                  >
                    Bottom
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Continue Button */}
        <div className="flex justify-between mt-8">
          <div className="text-sm text-muted-foreground">
            {/* <p>✓ Template uploaded</p>
            <p>✓ Design customized</p> */}
          </div>
          <Button
            size="lg"
            onClick={() => {
              // Save all settings to localStorage for certificate generation
              localStorage.setItem(
                "namePosition",
                JSON.stringify(namePosition),
              );
              localStorage.setItem("fontSize", fontSize[0].toString());
              localStorage.setItem("fontFamily", fontFamily);
              localStorage.setItem("textColor", textColor);
              navigate("/upload-names");
            }}
            className="px-8"
          >
            Continue to Name Upload
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
