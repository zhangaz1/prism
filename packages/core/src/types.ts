import { IDiagnostic } from '@stoplight/types';
import { Either } from 'fp-ts/Either';
import { ReaderEither } from 'fp-ts/ReaderEither';
import { ReaderTaskEither } from 'fp-ts/ReaderTaskEither';
import { TaskEither } from 'fp-ts/TaskEither';
import { Logger } from 'pino';
import { NonEmptyArray } from 'fp-ts/NonEmptyArray';
export type IPrismDiagnostic = Omit<IDiagnostic, 'range' | 'path'> & { path?: string[] };

export interface IPrism<Resource, Input, Output, Config extends IPrismConfig> {
  request: (input: Input, resources: Resource[], config?: Config) => TaskEither<Error, IPrismOutput<Output>>;
}

export interface IPrismConfig {
  mock: false | unknown;
  checkSecurity: boolean;
  validateRequest: boolean;
  validateResponse: boolean;
  errors: boolean;
}

export type ValidatorFn<R, E> = (opts: { resource: R; element: E }) => Either<NonEmptyArray<IPrismDiagnostic>, E>;

export type IPrismProxyConfig = IPrismConfig & {
  mock: false;
  upstream: URL;
};

export type IPrismComponents<Resource, Input, Output, Config extends IPrismConfig> = {
  route: (opts: { resources: Resource[]; input: Input }) => Either<Error, Resource>;
  validateInput: ValidatorFn<Resource, Input>;
  validateSecurity: ValidatorFn<Resource, Input>;
  validateOutput: ValidatorFn<Resource, Output>;
  forward: (input: IPrismInput<Input>, baseUrl: string) => ReaderTaskEither<Logger, Error, Output>;
  mock: (opts: {
    resource: Resource;
    input: IPrismInput<Input>;
    config: Config['mock'];
  }) => ReaderEither<Logger, Error, Output>;
  logger: Logger;
};

export interface IPrismInput<I> {
  data: I;
  validations: IPrismDiagnostic[];
}

export interface IPrismOutput<O> {
  output: O;
  validations: {
    input: IPrismDiagnostic[];
    output: IPrismDiagnostic[];
  };
}
