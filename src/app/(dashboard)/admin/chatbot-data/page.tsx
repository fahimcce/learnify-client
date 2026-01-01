"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { baseUrl } from "@/redux/api/api";
import { toast } from "sonner";
import { Loader2, Save, RotateCcw, Sparkles, Shield } from "lucide-react";

export default function ChatbotDataPage() {
  const token = useSelector((state: RootState) => state.auth.token);
  const [data, setData] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${baseUrl}/chatbot/get-data`);
      const result = await res.json();
      if (result.success && result.data) {
        setData(result.data.value);
      }
    } catch (error) {
      toast.error("Failed to fetch chatbot data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!data.trim()) {
      toast.error("Data cannot be empty");
      return;
    }

    try {
      setIsSaving(true);
      const res = await fetch(`${baseUrl}/chatbot/update-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token || "",
        },
        body: JSON.stringify({ data }),
      });

      const result = await res.json();
      if (result.success) {
        toast.success("Chatbot records updated successfully");
      } else {
        toast.error(result.message || "Failed to update data");
      }
    } catch (error) {
      toast.error("An error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
          AI Chatbot Knowledge Base
        </h1>
        <p className="text-muted-foreground font-medium">
          Manage the data and information that the UTM AI Assistant uses to respond to users.
        </p>
      </div>

      <Card className="border-2 border-red-500/10 shadow-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/10 dark:to-orange-900/10 border-b border-red-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-600 rounded-lg shadow-lg shadow-red-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">UTM Knowledge Corpus</CardTitle>
                <CardDescription>Configure the specialized data for the assistant</CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchData} 
                disabled={isLoading || isSaving}
                className="hover:bg-red-50 border-red-200"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button 
                size="sm" 
                onClick={handleSave} 
                disabled={isLoading || isSaving}
                className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="h-[500px] flex flex-col items-center justify-center gap-4 text-muted-foreground font-medium">
              <Loader2 className="w-10 h-10 animate-spin text-red-600" />
              <p>Loading knowledge base...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl blur opacity-10 group-focus-within:opacity-20 transition duration-500"></div>
                <textarea
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className="relative w-full h-[600px] p-6 rounded-xl border-2 border-red-100 dark:border-red-900 bg-background font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all resize-none"
                  placeholder="Paste your UTM knowledge base text here..."
                />
              </div>
              <div className="flex items-center gap-2 p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900/30">
                <div className="p-1.5 bg-orange-500 rounded-full">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <p className="text-sm text-orange-800 dark:text-orange-200 font-medium">
                  Note: This data is stored directly in the database and will take effect immediately for all users.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
