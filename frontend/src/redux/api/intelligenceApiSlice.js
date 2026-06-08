import { INTELLIGENCE_URL } from "../constants";
import { apiSlice } from "./apiSlice";

export const intelligenceApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPersonalizedRecommendations: builder.query({
      query: () => `${INTELLIGENCE_URL}/recommendations`,
      keepUnusedDataFor: 60,
    }),
    getSubscriptionPlan: builder.query({
      query: () => `${INTELLIGENCE_URL}/subscription-plan`,
      keepUnusedDataFor: 60,
    }),
    getPricingInsight: builder.query({
      query: (productId) => `${INTELLIGENCE_URL}/products/${productId}/pricing-insight`,
      keepUnusedDataFor: 60,
    }),
    getIntelligenceDashboard: builder.query({
      query: () => `${INTELLIGENCE_URL}/dashboard`,
      keepUnusedDataFor: 30,
    }),
    getMyLimitOrders: builder.query({
      query: () => `${INTELLIGENCE_URL}/limit-orders/me`,
      keepUnusedDataFor: 15,
    }),
    getBlindTastingChallenge: builder.query({
      query: () => `${INTELLIGENCE_URL}/blind-tasting/challenge`,
      keepUnusedDataFor: 15,
    }),
    runPricingEngine: builder.mutation({
      query: (payload = { persistPrice: true }) => ({
        url: `${INTELLIGENCE_URL}/pricing/run`,
        method: "POST",
        body: payload,
      }),
    }),
    conciergeChat: builder.mutation({
      query: (payload) => ({
        url: `${INTELLIGENCE_URL}/concierge`,
        method: "POST",
        body: payload,
      }),
    }),
    placeLimitOrder: builder.mutation({
      query: ({ productId, ...payload }) => ({
        url: `${INTELLIGENCE_URL}/products/${productId}/limit-orders`,
        method: "POST",
        body: payload,
      }),
    }),
    createCustomRoast: builder.mutation({
      query: ({ productId, ...payload }) => ({
        url: `${INTELLIGENCE_URL}/products/${productId}/custom-roast`,
        method: "POST",
        body: payload,
      }),
    }),
    submitBlindTastingFlight: builder.mutation({
      query: (payload) => ({
        url: `${INTELLIGENCE_URL}/blind-tasting/submit`,
        method: "POST",
        body: payload,
      }),
    }),
  }),
});

export const {
  useConciergeChatMutation,
  useCreateCustomRoastMutation,
  useGetIntelligenceDashboardQuery,
  useGetBlindTastingChallengeQuery,
  useGetMyLimitOrdersQuery,
  useGetPersonalizedRecommendationsQuery,
  useGetPricingInsightQuery,
  useGetSubscriptionPlanQuery,
  usePlaceLimitOrderMutation,
  useRunPricingEngineMutation,
  useSubmitBlindTastingFlightMutation,
} = intelligenceApiSlice;
