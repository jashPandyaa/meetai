import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { cva , type VariantProps } from "class-variance-authority";
import { CircleCheckIcon } from "lucide-react";

const pricingCardVariants = cva("rounded-lg w-full border", {
    variants: {
        variant: {
            default: "bg-white text-black border-gray-200",
            highlighted: "bg-gradient-to-br from-[#093C23] to-[#051B16] text-white border-[#093C23]",
        },    
    },
    defaultVariants: {
        variant: "default",
    }
});

const pricingCardIconVariants = cva("size-5 shrink-0", {
    variants: {
        variant: {
            default: "fill-primary text-white",
            highlighted: "fill-white text-black",
        },    
    },
    defaultVariants: {
        variant: "default",
    }
});

const pricingCardSecondaryTextVariants = cva("", {
    variants: {
        variant: {
            default: "text-neutral-700",
            highlighted: "text-neutral-300",
        },    
    },
});

const pricingCardBadgeVariants = cva("text-black text-xs font-normal px-2 py-1", {
    variants: {
        variant: {
            default: "bg-primary/20",
            highlighted: "bg-[#F5B797]",
        },    
    },
    defaultVariants: {
        variant: "default",
    }
});

interface Props extends VariantProps<typeof pricingCardVariants>{
    badge?: string | null;
    price: number;
    features: string[];
    title: string;
    description?: string | null;
    priceSuffix: string;
    className?: string;
    buttonText: string;
    onClick: () => void;
};

export const PricingCard = ({
    badge,
    price,
    features,
    title,
    description,
    priceSuffix,
    className,
    buttonText,
    onClick,
    variant,
}: Props) => {
    return (
        <div className={cn(pricingCardVariants({ variant }), className)}>
            {/* Header Section */}
            <div className="p-6 pb-4">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex flex-col gap-2 flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap"> 
                            <h6 className="font-semibold text-xl leading-tight">
                                {title}
                            </h6>
                            {badge && (
                                <Badge className={cn(pricingCardBadgeVariants({ variant }))}>
                                    {badge}
                                </Badge>
                            )}
                        </div>
                        {description && (
                            <p className={cn("text-sm leading-relaxed", pricingCardSecondaryTextVariants({ variant }))}>
                                {description}
                            </p>
                        )}
                    </div>
                    
                    <div className="flex items-baseline gap-1 shrink-0">
                        <h4 className="text-3xl font-semibold leading-none">
                            {Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "USD",
                                maximumFractionDigits: 0,
                            }).format(price)}
                        </h4>
                        <span className={cn("text-sm", pricingCardSecondaryTextVariants({ variant }))}>
                            {priceSuffix}
                        </span>
                    </div>
                </div>
            </div>

            {/* Separator */}
            <div className="px-6">
                <Separator className={cn(
                    "opacity-20",
                    variant === "highlighted" ? "bg-white/20" : "bg-gray-200"
                )} />
            </div>

            {/* Button Section */}
            <div className="p-6 pt-4">
                <Button 
                    className="w-full h-11"
                    size="lg"
                    variant={variant === "highlighted" ? "default" : "outline"}
                    onClick={onClick}
                >
                    {buttonText}
                </Button>
            </div>

            {/* Features Section */}
            <div className="px-6 pb-6">
                <div className="space-y-4">
                    <p className="font-semibold text-sm uppercase tracking-wide opacity-90">
                        Features
                    </p>
                    <ul className="space-y-3">
                        {features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <CircleCheckIcon 
                                    className={cn(pricingCardIconVariants({ variant }))}
                                />
                                <span className={cn(
                                    "text-sm leading-relaxed flex-1",
                                    pricingCardSecondaryTextVariants({ variant })
                                )}>
                                    {feature}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};