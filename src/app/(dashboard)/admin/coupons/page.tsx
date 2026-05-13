import React from "react";
import { getCoupons } from "@/app/actions/coupon";
import CouponManager from "@/components/Dashboard/CouponManager";

const CouponsPage = async () => {
  const coupons = await getCoupons();

  return (
    <div className="font-euclid-circular-a">
      <CouponManager initialCoupons={coupons} />
    </div>
  );
};

export default CouponsPage;
