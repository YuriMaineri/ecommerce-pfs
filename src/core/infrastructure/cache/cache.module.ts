import { Global, Module } from '@nestjs/common';
import { CACHE_SERVICE } from '../../application/injection-tokens';
import { RedisCacheService } from './redis-cache.service';

@Global()
@Module({
  providers: [{ provide: CACHE_SERVICE, useClass: RedisCacheService }],
  exports: [CACHE_SERVICE],
})
export class CacheModule {}
