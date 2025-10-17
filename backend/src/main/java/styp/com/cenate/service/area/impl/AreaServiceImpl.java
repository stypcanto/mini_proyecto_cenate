private AreaResponse mapToResponse(Area area) {
    return AreaResponse.builder()
            .idArea(area.getIdArea())
            .descArea(area.getDescArea())
            .statArea(area.getStatArea())
            .createdAt(area.getCreatedAt())
            .updatedAt(area.getUpdatedAt())
            .build();
}
