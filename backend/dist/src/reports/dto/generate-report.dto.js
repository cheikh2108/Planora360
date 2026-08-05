"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateReportDto = exports.ReportFormat = exports.ReportType = void 0;
const class_validator_1 = require("class-validator");
var ReportType;
(function (ReportType) {
    ReportType["ACTIVITES"] = "activites";
    ReportType["BUDGET"] = "budget";
    ReportType["PERFORMANCE"] = "performance";
    ReportType["RETARDS"] = "retards";
    ReportType["INDICATEURS"] = "indicateurs";
})(ReportType || (exports.ReportType = ReportType = {}));
var ReportFormat;
(function (ReportFormat) {
    ReportFormat["PDF"] = "pdf";
    ReportFormat["EXCEL"] = "excel";
})(ReportFormat || (exports.ReportFormat = ReportFormat = {}));
class GenerateReportDto {
    type;
    format;
    planId;
    dateFrom;
    dateTo;
}
exports.GenerateReportDto = GenerateReportDto;
__decorate([
    (0, class_validator_1.IsEnum)(ReportType),
    __metadata("design:type", String)
], GenerateReportDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(ReportFormat),
    __metadata("design:type", String)
], GenerateReportDto.prototype, "format", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateReportDto.prototype, "planId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], GenerateReportDto.prototype, "dateFrom", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], GenerateReportDto.prototype, "dateTo", void 0);
//# sourceMappingURL=generate-report.dto.js.map