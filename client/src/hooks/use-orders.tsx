import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./use-auth";
import { authService } from "@/lib/auth";
import type { Order, InsertOrder } from "@shared/schema";

export function useOrders() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = authService.isAdmin(user);

  // Fetch orders based on user role
  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ["orders", user?.id],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase.from("orders").select("*");
      
      // If not admin, only show user's own orders
      if (!isAdmin) {
        query = query.eq("agent_id", user.id);
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      
      if (error) {
        console.error('Fetch orders error:', error);
        throw new Error(error.message);
      }

      console.log('Fetched orders from database:', data);
      
      // Transform database column names to TypeScript property names
      return (data || []).map((order: any) => ({
        id: order.id,
        orderQuoteId: order.order_quote_id,
        date: new Date(order.date),
        status: order.status,
        agentId: order.agent_id,
        agentName: order.agent_name,
        totalAmount: order.total_amount,
        brokerFee: order.broker_fee,
        createdAt: new Date(order.created_at),
        updatedAt: new Date(order.updated_at),
      })) as Order[];
    },
    enabled: !!user,
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: InsertOrder) => {
      console.log('Creating order with data:', orderData);
      
      // Prepare the data for Supabase (match column names)
      const insertData = {
        order_quote_id: orderData.orderQuoteId,
        date: orderData.date,
        status: orderData.status,
        agent_id: orderData.agentId,
        agent_name: orderData.agentName,
        total_amount: parseFloat(orderData.totalAmount),
        broker_fee: parseFloat(orderData.brokerFee),
      };
      
      console.log('Formatted data for Supabase:', insertData);

      const { data, error } = await supabase
        .from("orders")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        throw new Error(error.message);
      }

      console.log('Order created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  // Update order mutation
  const updateOrderMutation = useMutation({
    mutationFn: async (orderData: Partial<Order> & { id: string }) => {
      console.log('Updating order with data:', orderData);
      const { id, ...updateData } = orderData;
      
      // Transform TypeScript property names to database column names
      const dbUpdateData: any = {
        updated_at: new Date().toISOString(),
      };
      
      if (updateData.orderQuoteId !== undefined) dbUpdateData.order_quote_id = updateData.orderQuoteId;
      if (updateData.date !== undefined) dbUpdateData.date = updateData.date;
      if (updateData.status !== undefined) dbUpdateData.status = updateData.status;
      if (updateData.agentId !== undefined) dbUpdateData.agent_id = updateData.agentId;
      if (updateData.agentName !== undefined) dbUpdateData.agent_name = updateData.agentName;
      if (updateData.totalAmount !== undefined) dbUpdateData.total_amount = parseFloat(updateData.totalAmount as any);
      if (updateData.brokerFee !== undefined) dbUpdateData.broker_fee = parseFloat(updateData.brokerFee as any);
      
      console.log('Formatted update data for Supabase:', dbUpdateData);

      const { data, error } = await supabase
        .from("orders")
        .update(dbUpdateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error('Supabase update error:', error);
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  // Delete single order mutation
  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      console.log('Deleting order with ID:', orderId);
      
      const { error } = await supabase
        .from("orders")
        .delete()
        .eq("id", orderId);

      if (error) {
        console.error('Supabase delete error:', error);
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  // Delete all orders mutation (admin only)
  const deleteAllOrdersMutation = useMutation({
    mutationFn: async () => {
      if (!isAdmin) {
        throw new Error("Unauthorized");
      }

      const { error } = await supabase.from("orders").delete().neq("id", "");

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  return {
    orders,
    isLoading,
    error,
    createOrder: createOrderMutation.mutateAsync,
    updateOrder: updateOrderMutation.mutateAsync,
    deleteOrder: deleteOrderMutation.mutateAsync,
    deleteAllOrders: deleteAllOrdersMutation.mutateAsync,
    isCreating: createOrderMutation.isPending,
    isUpdating: updateOrderMutation.isPending,
    isDeleting: deleteOrderMutation.isPending || deleteAllOrdersMutation.isPending,
  };
}
