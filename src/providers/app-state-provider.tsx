'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  ActivityLog,
  AdminRecord,
  CartItem,
  Coupon,
  DailySalesSummary,
  FeedbackEntry,
  MenuItem,
  OfferBanner,
  Order,
  OrderItem,
  OrderStatus,
  Review,
  UserRole,
} from '@/lib/types';
import {
  defaultCanteens,
  defaultCoupons,
  defaultMenuItems,
  defaultOfferBanners,
} from '@/lib/default-data';
import { Canteen, MenuCategory, FoodType } from '@/lib/types';

const STORAGE_KEY = 'achayapathra-canteen-state-v1';

const roundToTwo = (value: number) => Math.round(value * 100) / 100;
const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `id-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`;
};

export type Actor = {
  id: string;
  name: string;
  role: UserRole;
};

export type PlaceOrderPayload = {
  actor: Actor;
  canteenId: string;
  counterId: string;
  items: CartItem[];
  couponCode?: string | null;
  notes?: string;
  paymentMethod: 'UPI' | 'Card' | 'Wallet' | 'Cash';
};

export type UpdateOrderStatusPayload = {
  orderId: string;
  status: OrderStatus;
  actor: Actor;
  note?: string;
};

export type AddMenuItemPayload = {
  canteenId: string;
  counterId: string;
  name: string;
  category: MenuCategory;
  foodType: FoodType;
  price: number;
  imageUrl: string;
  ingredients: string[];
  description: string;
  tags?: string[];
};

export type UpdateMenuItemPayload = Partial<Omit<MenuItem, 'id'>>;

export type AddReviewPayload = {
  orderId: string;
  menuItemId: string;
  userId: string;
  rating: number;
  comment: string;
};

export type ToggleFavoritePayload = {
  userId: string;
  menuItemId: string;
};

export type SubmitFeedbackPayload = {
  userId: string;
  message: string;
  mood: FeedbackEntry['mood'];
};

export type AddCanteenPayload = {
  name: string;
  location: string;
  description?: string;
  counters: { id?: string; name: string; description?: string }[];
};

export type UpdateCanteenPayload = Partial<Omit<Canteen, 'id'>>;

export type AddAdminPayload = {
  name: string;
  email: string;
  phone?: string;
  canteenId: string;
  counterId?: string | null;
};

export type UpdateAdminPayload = Partial<Omit<AdminRecord, 'id'>>;

type AppState = {
  canteens: Canteen[];
  menuItems: MenuItem[];
  coupons: Coupon[];
  orders: Order[];
  reviews: Review[];
  activityLogs: ActivityLog[];
  banners: OfferBanner[];
  feedback: FeedbackEntry[];
  favoriteMap: Record<string, string[]>;
  admins: AdminRecord[];
  lastTokenSequence: number;
};

const defaultState: AppState = {
  canteens: defaultCanteens,
  menuItems: defaultMenuItems,
  coupons: defaultCoupons,
  orders: [],
  reviews: [],
  activityLogs: [],
  banners: defaultOfferBanners,
  feedback: [],
  favoriteMap: {},
  admins: [
    {
      id: 'admin-central-1',
      name: 'Lakshmi Narayanan',
      email: 'lakshmi.n@canteen.edu',
      phone: '+91 98400 11223',
      canteenId: 'canteen-central',
      counterId: null,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'admin-tech-1',
      name: 'Vikram Desai',
      email: 'vikram.d@canteen.edu',
      phone: '+91 98940 44661',
      canteenId: 'canteen-tech-park',
      counterId: 'tech-counter-1',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ],
  lastTokenSequence: 101,
};

type AppContextValue = {
  state: AppState;
  isHydrated: boolean;
  placeOrder: (payload: PlaceOrderPayload) => Order;
  updateOrderStatus: (payload: UpdateOrderStatusPayload) => Order | null;
  addMenuItem: (payload: AddMenuItemPayload, actor: Actor) => MenuItem;
  updateMenuItem: (
    menuItemId: string,
    updates: UpdateMenuItemPayload,
    actor: Actor
  ) => MenuItem | null;
  deleteMenuItem: (menuItemId: string, actor: Actor) => void;
  toggleMenuItemAvailability: (
    menuItemId: string,
    isAvailable: boolean,
    actor: Actor
  ) => void;
  addReview: (payload: AddReviewPayload) => Review;
  toggleFavorite: (payload: ToggleFavoritePayload) => string[];
  getFavorites: (userId: string) => string[];
  submitFeedback: (payload: SubmitFeedbackPayload) => FeedbackEntry;
  getFeedbackByUser: (userId: string) => FeedbackEntry[];
  getOrdersByUser: (userId: string) => Order[];
  getActiveOrdersByUser: (userId: string) => Order[];
  getOrdersByCanteen: (canteenId: string, counterId?: string | null) => Order[];
  getOrderById: (orderId: string) => Order | undefined;
  validateCoupon: (code: string | null | undefined) => Coupon | null;
  getCouponDiscount: (code: string | null | undefined, subtotal: number) => number;
  addCanteen: (payload: AddCanteenPayload, actor: Actor) => Canteen;
  updateCanteen: (
    canteenId: string,
    updates: UpdateCanteenPayload,
    actor: Actor
  ) => Canteen | null;
  removeCanteen: (canteenId: string, actor: Actor) => void;
  addAdminRecord: (payload: AddAdminPayload, actor: Actor) => AdminRecord;
  updateAdminRecord: (
    adminId: string,
    updates: UpdateAdminPayload,
    actor: Actor
  ) => AdminRecord | null;
  removeAdminRecord: (adminId: string, actor: Actor) => void;
  getDailySalesSummary: (canteenId?: string) => DailySalesSummary[];
};

const AppStateContext = createContext<AppContextValue | undefined>(undefined);

const deriveOrderItems = (items: CartItem[], menu: MenuItem[]): OrderItem[] => {
  return items
    .map((item) => {
      const menuItem = menu.find((menuItem) => menuItem.id === item.menuItemId);
      if (!menuItem) return null;
      return {
        menuItemId: menuItem.id,
        name: menuItem.name,
        qty: item.qty,
        price: menuItem.price,
      } satisfies OrderItem;
    })
    .filter((item): item is OrderItem => Boolean(item));
};

export const AppStateProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AppState>(defaultState);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<AppState>;
        setState((prev) => ({
          ...prev,
          ...parsed,
          canteens: parsed.canteens?.length ? parsed.canteens : prev.canteens,
          menuItems: parsed.menuItems?.length ? parsed.menuItems : prev.menuItems,
          coupons: parsed.coupons?.length ? parsed.coupons : prev.coupons,
          banners: parsed.banners?.length ? parsed.banners : prev.banners,
        }));
      }
    } catch (error) {
      console.warn('Failed to hydrate app state from storage', error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to persist app state', error);
    }
  }, [state, isHydrated]);

  const logActivity = useCallback((activity: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const entry: ActivityLog = {
      ...activity,
      id: generateId(),
      timestamp: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      activityLogs: [entry, ...prev.activityLogs].slice(0, 200),
    }));
  }, []);

  const validateCoupon = useCallback(
    (code: string | null | undefined): Coupon | null => {
      if (!code) return null;
      const normalized = code.trim().toUpperCase();
      const coupon = state.coupons.find(
        (item) => item.code.toUpperCase() === normalized && item.isActive
      );
      return coupon ?? null;
    },
    [state.coupons]
  );

  const getCouponDiscount = useCallback(
    (code: string | null | undefined, subtotal: number): number => {
      const coupon = validateCoupon(code);
      if (!coupon) return 0;

      if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
        return 0;
      }

      let discount = 0;
      if (coupon.discountType === 'percentage') {
        discount = (subtotal * coupon.value) / 100;
        if (coupon.maxDiscountAmount) {
          discount = Math.min(discount, coupon.maxDiscountAmount);
        }
      } else {
        discount = coupon.value;
      }
      return roundToTwo(discount);
    },
    [validateCoupon]
  );

  const placeOrder = useCallback(
    (payload: PlaceOrderPayload): Order => {
      const orderItems = deriveOrderItems(payload.items, state.menuItems);
      if (!orderItems.length) {
        throw new Error('Cannot place an order without valid menu items.');
      }

      const subtotal = roundToTwo(
        orderItems.reduce((total, item) => total + item.price * item.qty, 0)
      );
      const totalQuantity = orderItems.reduce((count, item) => count + item.qty, 0);
      const serviceCharge = roundToTwo(totalQuantity * 2);
      const gst = roundToTwo(subtotal * 0.05);
      const discount = getCouponDiscount(payload.couponCode, subtotal);
      const totalAmount = roundToTwo(subtotal + gst + serviceCharge - discount);

      let createdOrder: Order | null = null;

      setState((prev) => {
        const nextSequence = prev.lastTokenSequence + 1;
        const tokenNumber = `TN${String(nextSequence).padStart(3, '0')}`;
        const order: Order = {
          id: generateId(),
          userId: payload.actor.id,
          userName: payload.actor.name,
          canteenId: payload.canteenId,
          counterId: payload.counterId,
          items: orderItems,
          subtotal,
          gst,
          serviceCharge,
          discount,
          totalAmount,
          couponCode: payload.couponCode ?? null,
          paymentStatus: 'Paid',
          status: 'Pending',
          tokenNumber,
          paymentMethod: payload.paymentMethod,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          notes: payload.notes,
        };
        createdOrder = order;
        return {
          ...prev,
          orders: [order, ...prev.orders],
          lastTokenSequence: nextSequence,
        };
      });

      if (createdOrder) {
        logActivity({
          actor: payload.actor,
          action: 'order.created',
          metadata: {
            orderId: createdOrder.id,
            canteenId: createdOrder.canteenId,
            counterId: createdOrder.counterId,
            totalAmount: createdOrder.totalAmount,
          },
        });
        return createdOrder;
      }
      throw new Error('Failed to create order.');
    },
    [getCouponDiscount, logActivity, state.menuItems]
  );

  const updateOrderStatus = useCallback(
    ({ orderId, status, actor, note }: UpdateOrderStatusPayload): Order | null => {
      let updatedOrder: Order | null = null;
      setState((prev) => {
        const orders = prev.orders.map((order) => {
          if (order.id !== orderId) return order;
          const paymentStatus =
            status === 'Cancelled' || status === 'Rejected'
              ? order.paymentStatus === 'Paid'
                ? 'Refunded'
                : order.paymentStatus
              : order.paymentStatus;
          updatedOrder = {
            ...order,
            status,
            paymentStatus,
            updatedAt: new Date().toISOString(),
          };
          return updatedOrder;
        });
        return {
          ...prev,
          orders,
        };
      });

      if (updatedOrder) {
        logActivity({
          actor,
          action: 'order.status.changed',
          metadata: {
            orderId: updatedOrder.id,
            status,
            note,
          },
        });
      }
      return updatedOrder;
    },
    [logActivity]
  );

  const addMenuItem = useCallback(
    (payload: AddMenuItemPayload, actor: Actor): MenuItem => {
      const menuItem: MenuItem = {
        id: generateId(),
        canteenId: payload.canteenId,
        counterId: payload.counterId,
        name: payload.name,
        category: payload.category,
        foodType: payload.foodType,
        price: payload.price,
        imageUrl: payload.imageUrl,
        ingredients: payload.ingredients,
        description: payload.description,
        isAvailable: true,
        rating: 4.5,
        ratingCount: 0,
        tags: payload.tags ?? [],
      };
      setState((prev) => ({
        ...prev,
        menuItems: [menuItem, ...prev.menuItems],
      }));
      logActivity({
        actor,
        action: 'menu.item.created',
        metadata: { menuItemId: menuItem.id, canteenId: menuItem.canteenId },
      });
      return menuItem;
    },
    [logActivity]
  );

  const updateMenuItem = useCallback(
    (menuItemId: string, updates: UpdateMenuItemPayload, actor: Actor): MenuItem | null => {
      let updated: MenuItem | null = null;
      setState((prev) => {
        const menuItems = prev.menuItems.map((item) => {
          if (item.id !== menuItemId) return item;
          updated = { ...item, ...updates };
          return updated;
        });
        return {
          ...prev,
          menuItems,
        };
      });
      if (updated) {
        logActivity({
          actor,
          action: 'menu.item.updated',
          metadata: { menuItemId: updated.id },
        });
      }
      return updated;
    },
    [logActivity]
  );

  const deleteMenuItem = useCallback(
    (menuItemId: string, actor: Actor) => {
      setState((prev) => ({
        ...prev,
        menuItems: prev.menuItems.filter((item) => item.id !== menuItemId),
      }));
      logActivity({
        actor,
        action: 'menu.item.deleted',
        metadata: { menuItemId },
      });
    },
    [logActivity]
  );

  const toggleMenuItemAvailability = useCallback(
    (menuItemId: string, isAvailable: boolean, actor: Actor) => {
      setState((prev) => ({
        ...prev,
        menuItems: prev.menuItems.map((item) =>
          item.id === menuItemId ? { ...item, isAvailable } : item
        ),
      }));
      logActivity({
        actor,
        action: 'menu.item.availability_toggled',
        metadata: { menuItemId, isAvailable },
      });
    },
    [logActivity]
  );

  const addReview = useCallback((payload: AddReviewPayload): Review => {
    const review: Review = {
      id: generateId(),
      comment: payload.comment,
      menuItemId: payload.menuItemId,
      orderId: payload.orderId,
      userId: payload.userId,
      rating: payload.rating,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => {
      const menuItems = prev.menuItems.map((item) => {
        if (item.id !== payload.menuItemId) return item;
        const totalRating = item.rating * item.ratingCount + payload.rating;
        const ratingCount = item.ratingCount + 1;
        const rating = roundToTwo(totalRating / ratingCount);
        return {
          ...item,
          rating,
          ratingCount,
        };
      });
      return {
        ...prev,
        reviews: [review, ...prev.reviews],
        menuItems,
      };
    });
    return review;
  }, []);

  const toggleFavorite = useCallback(({ userId, menuItemId }: ToggleFavoritePayload) => {
    let favorites: string[] = [];
    setState((prev) => {
      const existing = prev.favoriteMap[userId] ?? [];
      const isAlreadyFavorite = existing.includes(menuItemId);
      favorites = isAlreadyFavorite
        ? existing.filter((id) => id !== menuItemId)
        : [...existing, menuItemId];
      return {
        ...prev,
        favoriteMap: {
          ...prev.favoriteMap,
          [userId]: favorites,
        },
      };
    });
    return favorites;
  }, []);

  const getFavorites = useCallback(
    (userId: string) => state.favoriteMap[userId] ?? [],
    [state.favoriteMap]
  );

  const submitFeedback = useCallback((payload: SubmitFeedbackPayload): FeedbackEntry => {
    const entry: FeedbackEntry = {
      id: generateId(),
      userId: payload.userId,
      message: payload.message,
      mood: payload.mood,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      feedback: [entry, ...prev.feedback],
    }));
    return entry;
  }, []);

  const getFeedbackByUser = useCallback(
    (userId: string) => state.feedback.filter((item) => item.userId === userId),
    [state.feedback]
  );

  const getOrdersByUser = useCallback(
    (userId: string) => state.orders.filter((order) => order.userId === userId),
    [state.orders]
  );

  const getActiveOrdersByUser = useCallback(
    (userId: string) =>
      state.orders.filter(
        (order) =>
          order.userId === userId && ['Pending', 'Cooking', 'Ready'].includes(order.status)
      ),
    [state.orders]
  );

  const getOrdersByCanteen = useCallback(
    (canteenId: string, counterId?: string | null) =>
      state.orders.filter((order) => {
        if (order.canteenId !== canteenId) return false;
        if (!counterId) return true;
        return order.counterId === counterId;
      }),
    [state.orders]
  );

  const getOrderById = useCallback(
    (orderId: string) => state.orders.find((order) => order.id === orderId),
    [state.orders]
  );

  const addCanteen = useCallback(
    (payload: AddCanteenPayload, actor: Actor): Canteen => {
      const canteen: Canteen = {
        id: generateId(),
        name: payload.name,
        location: payload.location,
        description: payload.description,
        counters: payload.counters.map((counter) => ({
          id: counter.id ?? generateId(),
          name: counter.name,
          description: counter.description,
        })),
        isActive: true,
        totalOrders: 0,
        totalRevenue: 0,
      };
      setState((prev) => ({
        ...prev,
        canteens: [canteen, ...prev.canteens],
      }));
      logActivity({
        actor,
        action: 'canteen.created',
        metadata: { canteenId: canteen.id },
      });
      return canteen;
    },
    [logActivity]
  );

  const updateCanteen = useCallback(
    (canteenId: string, updates: UpdateCanteenPayload, actor: Actor): Canteen | null => {
      let updated: Canteen | null = null;
      setState((prev) => {
        const canteens = prev.canteens.map((canteen) => {
          if (canteen.id !== canteenId) return canteen;
          updated = {
            ...canteen,
            ...updates,
            counters:
              updates.counters?.map((counter) => ({
                id: counter.id ?? generateId(),
                name: counter.name,
                description: counter.description,
              })) ?? canteen.counters,
          };
          return updated;
        });
        return {
          ...prev,
          canteens,
        };
      });
      if (updated) {
        logActivity({
          actor,
          action: 'canteen.updated',
          metadata: { canteenId: updated.id },
        });
      }
      return updated;
    },
    [logActivity]
  );

  const removeCanteen = useCallback(
    (canteenId: string, actor: Actor) => {
      setState((prev) => ({
        ...prev,
        canteens: prev.canteens.filter((c) => c.id !== canteenId),
        menuItems: prev.menuItems.filter((item) => item.canteenId !== canteenId),
        admins: prev.admins.filter((admin) => admin.canteenId !== canteenId),
      }));
      logActivity({
        actor,
        action: 'canteen.deleted',
        metadata: { canteenId },
      });
    },
    [logActivity]
  );

  const addAdminRecord = useCallback(
    (payload: AddAdminPayload, actor: Actor): AdminRecord => {
      const admin: AdminRecord = {
        id: generateId(),
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        canteenId: payload.canteenId,
        counterId: payload.counterId ?? null,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      setState((prev) => ({
        ...prev,
        admins: [admin, ...prev.admins],
      }));
      logActivity({
        actor,
        action: 'admin.created',
        metadata: { adminId: admin.id, canteenId: admin.canteenId },
      });
      return admin;
    },
    [logActivity]
  );

  const updateAdminRecord = useCallback(
    (adminId: string, updates: UpdateAdminPayload, actor: Actor): AdminRecord | null => {
      let updated: AdminRecord | null = null;
      setState((prev) => {
        const admins = prev.admins.map((admin) => {
          if (admin.id !== adminId) return admin;
          updated = { ...admin, ...updates };
          return updated;
        });
        return {
          ...prev,
          admins,
        };
      });
      if (updated) {
        logActivity({
          actor,
          action: 'admin.updated',
          metadata: { adminId: updated.id },
        });
      }
      return updated;
    },
    [logActivity]
  );

  const removeAdminRecord = useCallback(
    (adminId: string, actor: Actor) => {
      setState((prev) => ({
        ...prev,
        admins: prev.admins.filter((admin) => admin.id !== adminId),
      }));
      logActivity({
        actor,
        action: 'admin.deleted',
        metadata: { adminId },
      });
    },
    [logActivity]
  );

  const getDailySalesSummary = useCallback(
    (canteenId?: string): DailySalesSummary[] => {
      const filteredOrders = state.orders.filter((order) => {
        if (order.paymentStatus === 'Refunded') return false;
        if (['Cancelled', 'Rejected'].includes(order.status)) return false;
        if (canteenId) {
          return order.canteenId === canteenId;
        }
        return true;
      });

      const byDate = filteredOrders.reduce<Record<string, { revenue: number; count: number }>>(
        (acc, order) => {
          const dateKey = order.createdAt.slice(0, 10);
          if (!acc[dateKey]) {
            acc[dateKey] = { revenue: 0, count: 0 };
          }
          acc[dateKey].revenue += order.totalAmount;
          acc[dateKey].count += 1;
          return acc;
        },
        {}
      );

      return Object.entries(byDate)
        .map(([date, value]) => ({
          date,
          totalOrders: value.count,
          totalRevenue: roundToTwo(value.revenue),
          averageOrderValue: roundToTwo(value.revenue / value.count),
        }))
        .sort((a, b) => (a.date > b.date ? -1 : 1));
    },
    [state.orders]
  );

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      isHydrated,
      placeOrder,
      updateOrderStatus,
      addMenuItem,
      updateMenuItem,
      deleteMenuItem,
      toggleMenuItemAvailability,
      addReview,
      toggleFavorite,
      getFavorites,
      submitFeedback,
      getFeedbackByUser,
      getOrdersByUser,
      getActiveOrdersByUser,
      getOrdersByCanteen,
      getOrderById,
      validateCoupon,
      getCouponDiscount,
      addCanteen,
      updateCanteen,
      removeCanteen,
      addAdminRecord,
      updateAdminRecord,
      removeAdminRecord,
      getDailySalesSummary,
    }),
    [
      state,
      isHydrated,
      placeOrder,
      updateOrderStatus,
      addMenuItem,
      updateMenuItem,
      deleteMenuItem,
      toggleMenuItemAvailability,
      addReview,
      toggleFavorite,
      getFavorites,
      submitFeedback,
      getFeedbackByUser,
      getOrdersByUser,
      getActiveOrdersByUser,
      getOrdersByCanteen,
      getOrderById,
      validateCoupon,
      getCouponDiscount,
      addCanteen,
      updateCanteen,
      removeCanteen,
      addAdminRecord,
      updateAdminRecord,
      removeAdminRecord,
      getDailySalesSummary,
    ]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};
