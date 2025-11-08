import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  sql?: string;
  data?: any[];
  columns?: string[];
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await api.chatWithData(input);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Found ${response.row_count} result(s)`,
        sql: response.sql,
        data: response.data,
        columns: response.columns,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to query data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-8 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Chat with Data</h1>
              <p className="text-muted-foreground mt-1">Ask questions about your invoice data in natural language</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-8 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4 max-w-md">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Start a conversation</h3>
                <p className="text-muted-foreground">
                  Ask questions like:
                </p>
                <div className="space-y-2 text-sm text-muted-foreground text-left">
                  <p>• "What's the total spend in the last 90 days?"</p>
                  <p>• "List top 5 vendors by spend"</p>
                  <p>• "Show overdue invoices"</p>
                </div>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-3xl ${message.type === 'user' ? 'w-auto' : 'w-full'}`}>
                  <Card className={`p-4 ${message.type === 'user' ? 'bg-primary text-primary-foreground' : ''}`}>
                    <p className="text-sm">{message.content}</p>
                    
                    {message.sql && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <p className="text-xs font-semibold text-muted-foreground mb-2">Generated SQL:</p>
                        <pre className="text-xs text-foreground overflow-x-auto">
                          <code>{message.sql}</code>
                        </pre>
                      </div>
                    )}

                    {message.data && message.data.length > 0 && (
                      <div className="mt-4 overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border">
                              {message.columns?.map((col) => (
                                <th key={col} className="text-left py-2 px-3 font-medium text-muted-foreground">
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {message.data.slice(0, 10).map((row, idx) => (
                              <tr key={idx} className="border-b border-border">
                                {message.columns?.map((col) => (
                                  <td key={col} className="py-2 px-3 text-foreground">
                                    {typeof row[col] === 'number' 
                                      ? row[col].toLocaleString() 
                                      : row[col]?.toString() || 'N/A'}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {message.data.length > 10 && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Showing 10 of {message.data.length} results
                          </p>
                        )}
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex justify-start">
              <Card className="p-4 max-w-3xl">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-8 border-t border-border">
          <div className="flex gap-4 max-w-4xl mx-auto">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about your data..."
              disabled={loading}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={loading || !input.trim()}>
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Chat;
