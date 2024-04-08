"use client";
import { loadStripe } from "@stripe/stripe-js";
import {
    EmbeddedCheckoutProvider,
    EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { useCallback, useRef, useState } from "react";

export default function EmbeddedCheckoutButton() {

    const stripePromise = loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
    );

    const [showCheckout, setShowCheckout] = useState(false);
    const modalRef = useRef<HTMLDialogElement>(null);

    const fetchClientSecret = useCallback(() => {
        // Create a Checkout Session
        return fetch("/api/embedded-checkout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ priceId: "price_1LlopDB0iKO7xPnMP89uXxtg" }),
        })
            .then((res) => res.json())
            .then((data) => data.client_secret);
    }, []);

    const options = { fetchClientSecret };

    const handleCheckoutClick = () => {
        setShowCheckout(true);
        modalRef.current?.showModal();
    };

    const handleCloseModal = () => {
        setShowCheckout(false);
        modalRef.current?.close();
    };

    return (
        <div id="checkout" className="my-4 ">
            <button className="btn" onClick={handleCheckoutClick}>
                Open Modal with Embedded Checkout
            </button>
            <dialog ref={modalRef} className="modal">
                <div className="modal-box w-full h-full">
                    <div className="">
                        {showCheckout && (
                            <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
                                <EmbeddedCheckout />
                            </EmbeddedCheckoutProvider>
                        )}
                    </div>
                    {/* <div className="modal-action">
                        <form method="dialog">
                            <button className="btn" onClick={handleCloseModal}>
                                Close
                            </button>
                        </form>
                    </div> */}
                </div>
            </dialog>
        </div>
    );
}