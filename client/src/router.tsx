import type { AppRouter } from "@advanced-react/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import {
  createTRPCQueryUtils,
  createTRPCReact,
  getQueryKey,
  httpBatchLink,
  TRPCClientError,
  TRPCLink,
} from "@trpc/react-query";
import { observable } from "@trpc/server/observable";

import { ErrorComponent } from "./features/shared/components/ErrorComponent";
import { NotFoundComponent } from "./features/shared/components/NotFoundComponent";
import Spinner from "./features/shared/components/ui/Spinner";
import { env } from "./lib/utils/env";
import { routeTree } from "./routeTree.gen";

export const queryClient = new QueryClient();

export const trpc = createTRPCReact<AppRouter>({});

// 커스텀 링크를 생성하는 함수
// tRPC 요청을 처리하고 인증 관련 에러를 처리하는 역할을 합니다
const customLink: TRPCLink<AppRouter> = () => {
  // next: TRPCLink 체인에서 다음 링크를 호출하는 함수입니다. next(op)를 호출하면 현재 링크에서 처리한 요청(op)을 다음 링크(예: httpBatchLink)로 전달합니다.
  // op: Operation 객체로, tRPC 요청의 메타데이터를 포함합니다. 주요 속성은 다음과 같습니다:
  // op.type: 요청 타입 (query, mutation, subscription).
  // op.path: 호출된 프로시저의 경로 (예: auth.currentUser).
  // op.input: 클라이언트가 프로시저에 전달한 입력 데이터.
  // op.context: 요청에 포함된 컨텍스트 (예: 헤더, 인증 정보
  return ({ next, op }) => {
    return observable((observer) => {
      // next(op): 요청을 다음 링크로 전달하여 처리
      // observable: tRPC는 RxJS 기반으로 비동기 작업을 처리
      const unsubscribe = next(op).subscribe({
        next(value) {
          observer.next(value);
        },

        // 에러 처리 로직
        // UNAUTHORIZED 에러가 발생하면 로그인 페이지로 리다이렉트
        error(err) {
          if (err?.data?.code === "UNAUTHORIZED") {
            router.navigate({ to: "/login" });
          }

          observer.error(err);
        },

        complete() {
          observer.complete();
        },
      });

      return unsubscribe;
    });
  };
};

// HTTP 요청 헤더를 생성하는 함수
// 현재 로그인한 사용자의 토큰을 가져와 Authorization 헤더를 설정
function getHeaders() {
  const queryKey = getQueryKey(trpc.auth.currentUser);
  const token = queryClient.getQueryData<{ accessToken: string }>(
    queryKey,
  )?.accessToken;

  return {
    Authorization: token ? `Bearer ${token}` : undefined,
  };
}

// tRPC 클라이언트 설정
// 커스텀 링크와 HTTP 배치 링크를 사용하여 서버와 통신
// customLink: 에러 처리(특히 UNAUTHORIZED)를 담당.
// httpBatchLink: 실제 서버로 HTTP 요청을 보내는 링크. getHeaders로 생성된 인증 헤더와 credentials: "include"를 포함해 요청을 보냅니다.
// 흐름: 클라이언트 요청 → customLink (에러 처리) → httpBatchLink (서버 요청).
export const trpcClient = trpc.createClient({
  links: [
    customLink,
    httpBatchLink({
      url: env.VITE_SERVER_BASE_URL,
      // fetch 옵션 설정
      // credentials를 include로 설정하여 쿠키를 포함
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: "include",
        });
      },
      headers: getHeaders(),
    }),
  ],
});

export const trpcQueryUtils = createTRPCQueryUtils({
  queryClient,
  client: trpcClient,
});

function createRouter() {
  const router = createTanStackRouter({
    routeTree,
    defaultPreload: "intent",
    scrollRestoration: true,
    context: {
      trpcQueryUtils,
    },
    defaultPendingComponent: () => (
      <div className="flex items-center justify-center">
        <Spinner />
      </div>
    ),
    defaultErrorComponent: ErrorComponent,
    defaultNotFoundComponent: NotFoundComponent,
    Wrap: function WrapComponent({ children }: { children: React.ReactNode }) {
      return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </trpc.Provider>
      );
    },
  });
  return router;
}

export const router = createRouter();
declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}

export function isTRPCClientError(
  cause: unknown,
): cause is TRPCClientError<AppRouter> {
  return cause instanceof TRPCClientError;
}
