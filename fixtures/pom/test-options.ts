import { mergeTests, request, test as base } from '@playwright/test';
import { test as pageObjectFixture } from './page-object-fixture';
import { test as helperFixture } from '../helper/helper-fixture';

const test = mergeTests(pageObjectFixture, helperFixture);
const expect = base.expect;

export { test, expect, request }; 
