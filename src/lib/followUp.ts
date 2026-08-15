import { VendorRequest } from '../types';

/**
 * Number of days after which a pending vendor enquiry is flagged for staff follow-up.
 * Centralized constant to easily adjust threshold across the entire portal.
 */
export const FOLLOW_UP_THRESHOLD_DAYS = 3;

/**
 * Determines if a vendor request needs staff follow-up:
 * Condition: status is 'pending' AND elapsed time since creation/submission exceeds threshold.
 * Purely computed on page load / render without database mutation or automated external messaging.
 *
 * @param req The vendor request object
 * @param thresholdDays Days threshold (defaults to FOLLOW_UP_THRESHOLD_DAYS = 3)
 */
export function isFollowUpNeeded(req: VendorRequest, thresholdDays: number = FOLLOW_UP_THRESHOLD_DAYS): boolean {
  if (!req || req.status !== 'pending') return false;

  const dateStr = req.createdAt || req.submittedDate;
  if (!dateStr) return false;

  const createdTime = new Date(dateStr).getTime();
  if (isNaN(createdTime)) return false;

  const nowTime = Date.now();
  const diffDays = (nowTime - createdTime) / (1000 * 60 * 60 * 24);

  return diffDays >= thresholdDays;
}

/**
 * Calculates the number of full days a request has been pending.
 *
 * @param req The vendor request object
 */
export function getPendingDays(req: VendorRequest): number {
  if (!req) return 0;
  const dateStr = req.createdAt || req.submittedDate;
  if (!dateStr) return 0;

  const createdTime = new Date(dateStr).getTime();
  if (isNaN(createdTime)) return 0;

  const diffDays = Math.floor((Date.now() - createdTime) / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}
