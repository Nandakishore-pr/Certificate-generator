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
  FileText,
  Upload,
  Settings,
  Users,
  Download,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const steps = [
  {
    icon: Upload,
    title: "Upload Template",
    description: "Upload your certificate template image or PDF",
    href: "/upload-template",
    step: 1,
  },
  {
    icon: Settings,
    title: "Customize Design",
    description: "Adjust name placement, font, size and styling",
    href: "/preview-template",
    step: 2,
  },
  {
    icon: Users,
    title: "Add Recipients",
    description: "Upload Excel file with recipient names",
    href: "/upload-names",
    step: 3,
  },
  {
    icon: Download,
    title: "Download Certificates",
    description: "Generate and download your personalized certificates",
    href: "/download",
    step: 4,
  },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary/10">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 rounded-full bg-primary/10 mr-4">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              CertifyPro
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Generate beautiful, personalized certificates at scale. Upload your
            template, customize the design, and create certificates for hundreds
            of recipients in minutes.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Badge variant="outline" className="text-sm py-2 px-4">
              ✨ No Design Skills Required
            </Badge>
            <Badge variant="outline" className="text-sm py-2 px-4">
              🚀 Bulk Generation
            </Badge>
            <Badge variant="outline" className="text-sm py-2 px-4">
              📱 Mobile Friendly
            </Badge>
            <Badge variant="outline" className="text-sm py-2 px-4">
              📄 certificate designs(comming soon)
            </Badge>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mb-16">
          <Link to="/upload-template">
            <Button
              size="lg"
              className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Start Creating Certificates
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Steps Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {steps.map((step, index) => (
            <Link key={step.step} to={step.href} className="group">
              <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-2 hover:border-primary/50">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      Step {step.step}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                    {step.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-sm leading-relaxed">
                    {step.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center p-6 border-2">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-primary">
                Professional Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Works with any certificate template. Upload JPG or PNG, PDFs(comming soon)
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center p-6 border-2">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-primary">
                Bulk Processing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Generate hundreds of personalized certificates at once. Simply
                upload an Excel file with recipient details.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center p-6 border-2">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-primary">
                Instant Download
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Download all certificates as a convenient ZIP file. High-quality
                output ready for printing or digital distribution.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
