import React, { useState } from "react";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertOrderSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { convertToCentralTime, convertToUTC } from "@/utils/timezone";
import type { InsertOrder, Order } from "@shared/schema";

interface AddOrderModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: InsertOrder) => Promise<void>;
  editingOrder?: Order | null;
}

const statusOptions = [
  { label: "Quote", value: "quote" },
  { label: "In Process", value: "in_process" },
  { label: "Dispatched", value: "dispatched" },
  { label: "Canceled", value: "canceled" },
  { label: "Completed", value: "completed" }
];

export function AddOrderModal({ open, onClose, onSubmit, editingOrder }: AddOrderModalProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InsertOrder>({
    resolver: zodResolver(insertOrderSchema),
    defaultValues: {
      orderQuoteId: "",
      date: new Date().toISOString().slice(0, 16),
      status: "quote",
      agentId: user?.id || "",
      agentName: user?.name || "",
      totalAmount: "0",
      brokerFee: "0",
    },
  });

  // Update form when editing order changes
  React.useEffect(() => {
    if (editingOrder) {
      form.reset({
        orderQuoteId: editingOrder.orderQuoteId,
        date: convertToCentralTime(editingOrder.date).toISOString().slice(0, 16),
        status: editingOrder.status,
        agentId: editingOrder.agentId,
        agentName: editingOrder.agentName,
        totalAmount: editingOrder.totalAmount.toString(),
        brokerFee: editingOrder.brokerFee.toString(),
      });
    } else {
      form.reset({
        orderQuoteId: "",
        date: new Date().toISOString().slice(0, 16),
        status: "quote",
        agentId: user?.id || "",
        agentName: user?.name || "",
        totalAmount: "0",
        brokerFee: "0",
      });
    }
  }, [editingOrder, user, form]);

  const handleSubmit = async (data: InsertOrder) => {
    setIsSubmitting(true);
    try {
      console.log('Form data before submit:', data);
      
      // Convert Central Time to UTC before submitting
      const utcDate = convertToUTC(new Date(data.date)).toISOString();
      
      // Ensure we have valid numbers
      const totalAmount = typeof data.totalAmount === 'string' ? parseFloat(data.totalAmount) || 0 : data.totalAmount;
      const brokerFee = typeof data.brokerFee === 'string' ? parseFloat(data.brokerFee) || 0 : data.brokerFee;
      
      const submitData = {
        ...data,
        date: utcDate,
        agentId: user?.id || "",
        agentName: user?.name || "",
        totalAmount: totalAmount.toString(),
        brokerFee: brokerFee.toString(),
      };
      
      console.log('Final submit data:', submitData);
      
      await onSubmit(submitData);
      
      form.reset();
      onClose();
    } catch (error) {
      console.error("Error submitting order:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateOrderId = () => {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    return `Q-${year}-${timestamp}`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-slate-200 max-w-2xl max-h-[80vh] overflow-y-auto fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            {editingOrder ? "Edit Order/Quote" : "Add New Order/Quote"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="orderQuoteId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Order/Quote ID</FormLabel>
                    <div className="flex space-x-2">
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="ProABD Order Number"
                          className="bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-400 focus:border-blue-500"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => form.setValue("orderQuoteId", generateOrderId())}
                        className="bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600"
                      >
                        Generate
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Date (Central Time)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="datetime-local"
                        className="bg-slate-700 border-slate-600 text-slate-200 focus:border-blue-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-200 focus:border-blue-500">
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="text-slate-200 hover:bg-slate-700">
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="agentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Agent Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        readOnly
                        className="bg-slate-700 border-slate-600 text-slate-400 cursor-not-allowed"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Total Amount</FormLabel>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-slate-400">$</span>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-400 focus:border-blue-500 pl-8"
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="brokerFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Broker Fee</FormLabel>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-slate-400">$</span>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-400 focus:border-blue-500 pl-8"
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {isSubmitting ? "Saving..." : editingOrder ? "Update Order/Quote" : "Add Order/Quote"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
