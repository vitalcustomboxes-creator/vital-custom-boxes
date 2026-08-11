/**
 * components/ui/index.ts — FE-1 barrel. Import primitives from
 * "@/components/ui". Client components carry their own "use client";
 * the rest stay server-compatible.
 *
 * NOTE for FE-2/FE-3/BE-*: lucide-react v1.x renamed icons — use
 * LoaderCircle / CircleAlert / CloudUpload / CircleCheck (the old Loader2 /
 * AlertCircle / UploadCloud / CheckCircle2 aliases no longer exist).
 */
export { Button, type ButtonProps, type ButtonSize, type ButtonVariant } from "./button";
export { Input, type InputProps } from "./input";
export { Textarea, type TextareaProps } from "./textarea";
export { Select, type SelectOption, type SelectProps } from "./select";
export { Combobox, type ComboboxOption, type ComboboxProps } from "./combobox";
export {
  CountryDropdown,
  type CountryDropdownProps,
  type CountryOption,
} from "./country-dropdown";
export { PhoneNumberInput, type PhoneNumberInputProps } from "./phone-number-input";
export { Checkbox, type CheckboxProps } from "./checkbox";
export { RadioGroup, type RadioGroupProps, type RadioOption } from "./radio-group";
export { FileUpload, type FileUploadProps } from "./file-upload";
export { Badge, type BadgeProps, type BadgeVariant } from "./badge";
export { Rating, type RatingProps } from "./rating";
export { Breadcrumbs, type BreadcrumbItem, type BreadcrumbsProps } from "./breadcrumbs";
export { Accordion, type AccordionItem, type AccordionProps } from "./accordion";
export { Tabs, type TabItem, type TabsProps } from "./tabs";
export { Tooltip, type TooltipProps } from "./tooltip";
export { Modal, type ModalProps } from "./modal";
export { Drawer, type DrawerProps, type DrawerSide } from "./drawer";
export {
  Toast,
  ToastProvider,
  useToast,
  type ToastContextValue,
  type ToastOptions,
  type ToastProps,
  type ToastVariant,
} from "./toast";
export { Skeleton, type SkeletonProps, type SkeletonVariant } from "./skeleton";
export { Reveal, type RevealProps } from "./reveal";
export { cx } from "./cn";
