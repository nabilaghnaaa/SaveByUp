import {
  HiOutlineArchiveBox,
  HiOutlineBellAlert,
  HiOutlineCalendarDays,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineExclamationTriangle,
  HiOutlineHome,
  HiOutlinePencilSquare,
  HiOutlinePlusCircle,
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
  TbReceipt,
  TbRefresh,
  TbShieldCheck,
  TbWallet,
} from "react-icons/tb";

const iconMap = {
  dashboard: HiOutlineHome,
  add: HiOutlinePlusCircle,

  food: PiBowlFoodBold,
  stock: HiOutlineArchiveBox,
  total: TbBasket,
  safe: PiLeafBold,
  warning: HiOutlineExclamationTriangle,

  sold: PiStorefrontBold,
  store: PiStorefrontBold,
  market: HiOutlineShoppingBag,
  marketplace: PiStorefrontBold,

  waste: PiRecycleBold,
  used: PiCookingPotBold,
  discard: HiOutlineXCircle,

  edit: HiOutlinePencilSquare,
  delete: HiOutlineTrash,

  check: HiOutlineCheckCircle,
  clock: HiOutlineClock,
  calendar: HiOutlineCalendarDays,
  refresh: TbRefresh,

  user: HiOutlineUserCircle,
  profile: HiOutlineUserCircle,

  request: TbClipboardList,
  message: TbMessageCircle,
  notification: HiOutlineBellAlert,

  receipt: TbReceipt,
  wallet: TbWallet,
  shield: TbShieldCheck,
  sparkle: HiOutlineSparkles,
};

export default function AppIcon({
  name = "food",
  size = 20,
  className = "",
  strokeWidth,
}) {
  const Icon = iconMap[name] || PiBowlFoodBold;

  return (
    <Icon
      size={size}
      className={className}
      strokeWidth={strokeWidth}
      aria-hidden="true"
    />
  );
}