import Link from "next/link";
import Image from "next/image";
import { Heading, Text, Badge } from "@radix-ui/themes";
import { Separator } from "@radix-ui/themes";
import { CourseDetails } from "../../types";
import { useState } from "react";
import { StarFilledIcon } from "@radix-ui/react-icons";
import { MapPin, Star, User, ArrowRight } from "lucide-react";
import { formatImgLink } from "@/app/utils/functions";

const Class2Card = ({ classInfo }: { classInfo: CourseDetails }) => {
    return (
        <div className="group overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
            {/* Image container with overlay gradient at bottom */}
            <div className="relative h-56 overflow-hidden">
                <div className="w-full h-full overflow-hidden">
                    <img
                        src={formatImgLink(classInfo.image_1_Link) || "/api/placeholder/500/300"}
                        alt={classInfo.course_Name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none"></div>

                {/* Price badge */}
                <div className="absolute top-3 right-3 bg-white text-blue-600 font-bold px-3 py-1 rounded-md shadow z-10">
                    {classInfo.course_Price}
                </div>

                {/* Online badge */}
                {classInfo.online && (
                    <div className="absolute top-3 left-3 bg-blue-500 text-white px-3 py-1 rounded-md text-sm font-medium z-10">
                        Online
                    </div>
                )}

                {/* Course title positioned at bottom of image */}
                <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                    <h3 className="text-xl font-bold text-white mb-1">{classInfo.course_Name}</h3>

                    {/* Rating */}
                    {classInfo.rating && (
                        <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" />
                            <span className="text-sm text-white/90">{classInfo.rating.toFixed(1)}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Content section */}
            <div className="p-4">
                {/* Instructor info */}
                <div className="flex items-center mb-3 pb-3 border-b border-gray-100">
                    <img
                        src={formatImgLink(classInfo.instructor.pfp_link) || "/api/placeholder/40/40"}
                        alt={classInfo.instructor.name}
                        className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">
                        <span className="text-xs text-gray-500 block">Instructor</span>
                        {classInfo.instructor.name}
                    </span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                    {classInfo.tag_1 && (
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
                            {classInfo.tag_1}
                        </span>
                    )}
                    {classInfo.tag_2 && (
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
                            {classInfo.tag_2}
                        </span>
                    )}
                    {classInfo.tag_3 && (
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
                            {classInfo.tag_3}
                        </span>
                    )}
                </div>

                {/* Location and age */}
                <div className="flex flex-col gap-1 mb-4 text-xs text-gray-500">
                    {classInfo.address && !classInfo.online && (
                        <div className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                            <span className="truncate max-w-xs">{classInfo.address}</span>
                        </div>
                    )}
                    {classInfo.minimum_age > 0 && (
                        <div className="flex items-center">
                            <User className="w-3 h-3 mr-1 text-gray-400" />
                            <span>Minimum age: {classInfo.minimum_age}+</span>
                        </div>
                    )}
                </div>

                {/* Subtle action link instead of bright button */}
                <div className="flex justify-end">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center group-hover:underline transition-colors">
                        View Details
                        <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Class2Card;