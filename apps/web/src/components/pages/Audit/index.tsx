import React from "react"

import { Button } from "@/components/structure/Button"
import { Header } from "@/components/structure/Header"
import { Input } from "@/components/structure/Input"
import { Skeleton } from "@/components/structure/Skeleton"
import { Select } from "@/components/structure/Select"
import { Sidebar } from "@/components/structure/Sidebar"
import { Table } from "@/components/structure/Table"
import { Typography } from "@/components/structure/Typography"

import {
  AuditFiltersSkeleton,
  AuditTableSkeleton,
} from "./components/AuditLoading"
import { AuditDetailsSidePanel } from "./components/AuditDetailsSidePanel"
import {
  ALL_COMPANIES_LABEL,
  ALL_ACTORS_LABEL,
  ALL_ACTION_LABEL,
  ALL_ENTITY_LABEL,
} from "./utils"
import { useAudit } from "./hooks/useAudit"

export const Audit: React.FC = () => {
  const {
    actionOptions,
    actorOptions,
    auditSubtitle,
    companyOptions,
    detailsSidePanelRef,
    entityOptions,
    error,
    handleActionChange,
    handleActorChange,
    handleAuditRowSelect,
    handleCompanyChange,
    handleEntityIdChange,
    handleEntityTypeChange,
    handleFromDateChange,
    handleNextPage,
    handlePageSizeChange,
    handlePreviousPage,
    handleRefreshAuditLogs,
    handleToDateChange,
    isCompaniesLoading,
    isInitialLoading,
    isLoading,
    isRefreshing,
    isUsersLoading,
    meta,
    pageSizeOptions,
    selectedActionOption,
    selectedActorOption,
    selectedAuditLog,
    selectedCompanyOption,
    selectedEntityOption,
    selectedEntityId,
    selectedFrom,
    selectedPage,
    selectedPageSizeOption,
    selectedTo,
    tableData,
  } = useAudit()

  const hasActorFilter = actorOptions.length > 0
  const canGoPrevious = selectedPage > 1
  const canGoNext = meta.totalPages > 0 ? selectedPage < meta.totalPages : false

  return (
    <main className="h-screen overflow-hidden bg-surface-page text-content-primary">
      <div className="flex h-full overflow-hidden">
        <Sidebar />

        <section className="min-w-0 flex-1 overflow-y-auto px-5 pt-8 pb-24 sm:px-8 lg:px-10 lg:py-8">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <Header
                label="Auditoria"
                subtitle={auditSubtitle}
              />

              <Button
                value="Atualizar"
                icon="update"
                iconPlacement="start"
                variant="outlined"
                color="primary"
                fitWidth
                loading={isRefreshing}
                onClick={handleRefreshAuditLogs}
              />
            </div>

            {isInitialLoading ? (
              <>
                <AuditFiltersSkeleton />
                <AuditTableSkeleton />
              </>
            ) : (
              <>
                <section className="grid gap-4 rounded-2xl border border-border-subtle bg-surface-card p-5 shadow-[0_18px_50px_rgba(15,23,42,0.04)]">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Typography
                      variant="b2"
                      value="Filtros"
                      className="font-semibold"
                    />

                    <Typography
                      variant="legal"
                      value={`${meta.totalItems} evento(s) encontrados`}
                      className="text-content-muted"
                    />
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
                    {isCompaniesLoading && companyOptions.length <= 1 ? (
                      <Skeleton className="h-11 w-full rounded-xl" />
                    ) : companyOptions.length > 0 ? (
                      <Select
                        label={ALL_COMPANIES_LABEL}
                        options={companyOptions}
                        selectedItem={selectedCompanyOption}
                        buttonClassName="h-11 bg-surface-card"
                        onSelectionChange={handleCompanyChange}
                      />
                    ) : null}

                    {hasActorFilter ? (
                      isUsersLoading && actorOptions.length <= 1 ? (
                        <Skeleton className="h-11 w-full rounded-xl" />
                      ) : (
                        <Select
                          label={ALL_ACTORS_LABEL}
                          options={actorOptions}
                          selectedItem={selectedActorOption}
                          buttonClassName="h-11 bg-surface-card"
                          onSelectionChange={handleActorChange}
                        />
                      )
                    ) : (
                      <div className="grid gap-1 rounded-md border border-dashed border-border-subtle bg-surface-muted/40 px-4 py-3">
                        <Typography
                          variant="legal"
                          value="Autores"
                          className="text-content-muted"
                        />
                        <Typography
                          variant="b2"
                          value="Selecione uma empresa para filtrar por autor."
                          className="text-content-secondary"
                        />
                      </div>
                    )}

                    <Select
                      label={ALL_ENTITY_LABEL}
                      options={entityOptions}
                      selectedItem={selectedEntityOption}
                      buttonClassName="h-11 bg-surface-card"
                      onSelectionChange={handleEntityTypeChange}
                    />

                    <Select
                      label={ALL_ACTION_LABEL}
                      options={actionOptions}
                      selectedItem={selectedActionOption}
                      buttonClassName="h-11 bg-surface-card"
                      onSelectionChange={handleActionChange}
                    />

                    <Input
                      title="ID da entidade"
                      value={selectedEntityId}
                      type="text"
                      placeholder="Filtrar por ID do alvo"
                      className="xl:col-span-2"
                      onChange={handleEntityIdChange}
                    />

                    <Input
                      title="De"
                      value={selectedFrom}
                      type="date"
                      onChange={handleFromDateChange}
                    />

                    <Input
                      title="Ate"
                      value={selectedTo}
                      type="date"
                      onChange={handleToDateChange}
                    />

                    <Select
                      label="Itens por pagina"
                      options={pageSizeOptions}
                      selectedItem={selectedPageSizeOption}
                      buttonClassName="h-11 bg-surface-card"
                      onSelectionChange={handlePageSizeChange}
                    />
                  </div>

                  {error ? (
                    <Typography
                      variant="legal"
                      value={error.message}
                      className="text-danger-700"
                    />
                  ) : null}
                </section>

                <section className="grid gap-4 rounded-2xl border border-border-subtle bg-surface-card p-6 shadow-[0_18px_50px_rgba(15,23,42,0.04)]">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <Header
                      titleVariant="h4"
                      label="Eventos de auditoria"
                      subtitle="Cada linha representa uma acao registrada no sistema."
                    />

                    <Typography
                      variant="caption"
                      value={`Pagina ${selectedPage} de ${Math.max(meta.totalPages, 1)}`}
                    />
                  </div>

                  <Table
                    data={tableData}
                    getRowKey={(row) => row.ID?.value?.toString() ?? "audit-row"}
                    emptyMessage={isLoading ? "Carregando eventos..." : "Nenhum evento encontrado"}
                    minWidth="1280px"
                    className="overflow-hidden rounded-xl"
                    onRowSelect={handleAuditRowSelect}
                  />

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Typography
                      variant="caption"
                      value={`Mostrando ${tableData.length} de ${meta.totalItems} eventos`}
                    />

                    <div className="flex items-center gap-2">
                      <Button
                        value="Anterior"
                        variant="outlined"
                        color="primary"
                        disabled={!canGoPrevious}
                        onClick={handlePreviousPage}
                      />
                      <Button
                        value="Proxima"
                        variant="outlined"
                        color="primary"
                        disabled={!canGoNext}
                        onClick={handleNextPage}
                      />
                    </div>
                  </div>
                </section>
              </>
            )}
          </div>
        </section>
      </div>

      <AuditDetailsSidePanel ref={detailsSidePanelRef} log={selectedAuditLog} />
    </main>
  )
}
