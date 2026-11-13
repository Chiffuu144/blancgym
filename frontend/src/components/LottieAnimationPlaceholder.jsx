import { Lottie } from 'lottie-react';
import loadingDots from '../assets/loading-dots.json';

export default function LottieAnimationPlaceholder({ className = 'h-24 w-40' }) {
  return <div aria-hidden="true" className={className}>
    <Lottie animationData={loadingDots} autoplay loop className="h-full w-full" />
  </div>;
}
