"use server"

import { Card } from "@/components/ui/card";
import { currentUser } from "@clerk/nextjs/server";
import { Button } from "@radix-ui/themes";
import axios from "axios";
import { Check, X } from "lucide-react";
import Link from "next/link";
import React from "react";

export default async function Return() {
    const user = await currentUser();

    if (!user) {
        return null;
    }

    const res = await axios.post(`${process.env.NEXT_PUBLIC_HOSTNAME}/instructors/filter`, {
        user_id: user.id
    });

    const success = res.data[0].stripeConnectedLinked;

    return (
        <section className="w-full min-h-[80vh] flex items-center justify-center">
            <Card className="w-[350px]">
                <div className="p-6">
                    {success ? <SuccessBox /> : <ErrorBox />}
                </div>
            </Card>
        </section>
    );
}

function ErrorBox() {
    return (
        <>
            <div className="w-full flex justify-center">
                <X className="w-12 h-12 rounded-full bg-red-500/30 text-red-500 p-2" />
            </div>
            <div className="mt-3 text-center sm:mt-5 w-full">
                <h3 className="text-lg leading-6 font-medium">Stripe Linking Failed</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    Complete the linking process to start getting paid to teach.
                </p>

                <Button className="mt-5 sm:mt-6 w-full" asChild>
                    <Link href="/teacher">
                        Back to Dashboard
                    </Link>
                </Button>
            </div>
        </>
    )
}

function SuccessBox() {
    return (
        <>
            <div className="w-full flex justify-center">
                <Check className="w-12 h-12 rounded-full bg-green-500/30 text-green-500 p-2" />
            </div>
            <div className="mt-3 text-center sm:mt-5 w-full">
                <h3 className="text-lg leading-6 font-medium">Stripe Linking Successful</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    You can now start getting paid to teach!
                </p>

                <Button className="mt-5 sm:mt-6 w-full" asChild>
                    <Link href="/teacher">
                        Back to Dashboard
                    </Link>
                </Button>
            </div>
        </>
    )
}