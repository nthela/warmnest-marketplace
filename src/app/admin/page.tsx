"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Header } from "@/components/ui/header";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Id } from "../../convex/_generated/dataModel";

export default function AdminDashboard() {
    const pendingVendors = useQuery(api.vendors.listPendingVendors);
    const approveVendor = useMutation(api.vendors.approveVendor);

    const handleApprove = async (id: Id<"vendors">) => {
        if (confirm("Are you sure you want to approve this vendor?")) {
            await approveVendor({ vendorId: id });
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

                <Card>
                    <CardHeader>
                        <CardTitle>Pending Vendor Applications</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Store Name</TableHead>
                                    <TableHead>Slug</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingVendors === undefined ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                                    </TableRow>
                                ) : pendingVendors.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-4">No pending applications.</TableCell>
                                    </TableRow>
                                ) : (
                                    pendingVendors.map((vendor) => (
                                        <TableRow key={vendor._id}>
                                            <TableCell className="font-medium">{vendor.storeName}</TableCell>
                                            <TableCell>{vendor.slug}</TableCell>
                                            <TableCell>{vendor.description}</TableCell>
                                            <TableCell className="capitalize">{vendor.status}</TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" onClick={() => handleApprove(vendor._id)}>Approve</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
