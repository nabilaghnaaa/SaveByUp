import {
  HiOutlineArchiveBox,
  HiOutlineBellAlert,
  HiOutlineCalendarDays,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineExclamationTriangle,
  HiOutlinePencilSquare,
  HiOutlineShoppingBag,
  HiOutlineSparkles,
  HiOutlineTrash,
  HiOutlineUserCircle,
  HiOutlineXCircle,
} from "react-icons/hi2";

import {
  PiBowlFoodBold,
  PiCookingPotBold,
  PiLeafBold,
  PiRecycleBold,
  PiStorefrontBold,
} from "react-icons/pi";

import {
  TbBasket,
  TbClipboardList,
  TbMessageCircle,
} from "react-icons/tb";

const iconMap = {
  food: PiBowlFoodBold,
  stock: HiOutlineArchiveBox,
  total: TbBasket,
  safe: PiLeafBold,
  warning: HiOutlineExclamationTriangle,
  sold: PiStorefrontBold,
  waste: PiRecycleBold,
  used: PiCookingPotBold,
  market: HiOutlineShoppingBag,
  edit: HiOutlinePencilSquare,
  delete: HiOutlineTrash,
  discard: HiOutlineXCircle,
  check: HiOutlineCheckCircle,
  clock: HiOutlineClock,
  calendar: HiOutlineCalendarDays,
  user: HiOutlineUserCircle,
  request: TbClipboardList,
  message: TbMessageCircle,
  notification: HiOutlineBellAlert,
  sparkle: HiOutlineSparkles,
};

export default function AppIcon({ name = "food", className = "" }) {
  const Icon = iconMap[name] || PiBowlFoodBold;

  return <Icon className={className} aria-hidden="true" />;
}