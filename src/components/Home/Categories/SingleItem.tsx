import { Category } from "@/types/category";
import React, { useState } from "react";
import Image from "next/image";

const FALLBACK_IMAGE = "/images/categories/categories-01.png";

const SingleItem = ({ item }: { item: Category }) => {
  const [imgSrc, setImgSrc] = useState(item.img);

  return (
    <a href="#" className="group flex flex-col items-center">
      <div className="w-[130px] h-[130px] rounded-full overflow-hidden bg-[#F2F3F8] mb-4">
        <Image
          src={imgSrc}
          alt={item.title}
          width={130}
          height={130}
          className="w-full h-full object-cover"
          onError={() => setImgSrc(FALLBACK_IMAGE)}
        />
      </div>

      <div className="flex justify-center">
        <h3 className="inline-block font-medium text-center text-dark bg-gradient-to-r from-blue to-blue bg-[length:0px_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_3px] group-hover:bg-[length:100%_1px] group-hover:text-blue">
          {item.title}
        </h3>
      </div>
    </a>
  );
};

export default SingleItem;
