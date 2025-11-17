import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, CheckCircle2 } from "lucide-react";

interface FormData {
  fullName: string;
  email: string;
  company: string;
  role: string;
  teamSize: string;
  useCase: string;
}

export default function RequestAccessDialog() {
  const [open, setOpen] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    company: "",
    role: "",
    teamSize: "",
    useCase: "",
  });

  const handleSubmit = (): void => {
    // Validate required fields
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.company ||
      !formData.role ||
      !formData.teamSize
    ) {
      alert("Please fill in all required fields");
      return;
    }

    // Here you would typically send the data to your backend
    console.log("Form submitted:", formData);

    // Show success state
    setSubmitted(true);

    // Reset after 2 seconds
    setTimeout(() => {
      setSubmitted(false);
      setOpen(false);
      setFormData({
        fullName: "",
        email: "",
        company: "",
        role: "",
        teamSize: "",
        useCase: "",
      });
    }, 2000);
  };

  const handleChange = (field: keyof FormData, value: string): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="bg-slate-900 hover:bg-slate-800 text-white text-lg px-8"
        >
          Request Access
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        {!submitted ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                Join the Waitlist
              </DialogTitle>
              <DialogDescription>
                Get early access to ProxyAI. We'll notify you when we're ready
                to onboard you.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Work Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@company.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">
                  Company <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="company"
                  placeholder="Acme Inc."
                  value={formData.company}
                  onChange={(e) => handleChange("company", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">
                  Your Role <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="role"
                  placeholder="e.g. Product Manager, Engineer"
                  value={formData.role}
                  onChange={(e) => handleChange("role", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="teamSize">
                  Team Size <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.teamSize}
                  onValueChange={(value: string) =>
                    handleChange("teamSize", value)
                  }
                >
                  <SelectTrigger id="teamSize">
                    <SelectValue placeholder="Select team size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 people</SelectItem>
                    <SelectItem value="11-50">11-50 people</SelectItem>
                    <SelectItem value="51-200">51-200 people</SelectItem>
                    <SelectItem value="201-500">201-500 people</SelectItem>
                    <SelectItem value="500+">500+ people</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="useCase">How do you plan to use ProxyAI?</Label>
                <Textarea
                  id="useCase"
                  placeholder="Tell us about your meeting workflow and pain points..."
                  value={formData.useCase}
                  onChange={(e) => handleChange("useCase", e.target.value)}
                  rows={3}
                />
              </div>

              <Button
                onClick={handleSubmit}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                size="lg"
              >
                Join Waitlist
              </Button>
            </div>
          </>
        ) : (
          <div className="py-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <DialogTitle className="text-2xl font-bold mb-2">
              You're on the list!
            </DialogTitle>
            <DialogDescription className="text-base">
              We'll send you an email at {formData.email} when we're ready for
              you.
            </DialogDescription>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
